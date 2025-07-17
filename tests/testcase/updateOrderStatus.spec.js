const { test, expect } = require('@playwright/test');
const { OrderStatusUpdater, updatedOrders } = require('../../test-utils/updateOrderStatus');

const orderStatuses = [
    "wc-pending",
    "wc-processing", 
    "wc-on-hold",
    "wc-completed",
    "wc-cancelled",
    "wc-refunded",
    "wc-failed",
    "wc-checkout-draft"
];

test.describe('Google Sheets to WooCommerce Order Status Sync', () => {
    let statusUpdater;
    let originalStatus;
    let orderId;

    test.beforeAll(() => {
        statusUpdater = new OrderStatusUpdater('./tests/utilities/upload_key.json');
    });

    test('should fetch and verify current order status', async () => {
       
        const firstOrder = await statusUpdater.fetchFirstOrder('Orders!A2:Z2');
        expect.soft(firstOrder.length).toBeGreaterThan(2);
        [orderId, , originalStatus] = firstOrder;
        expect.soft(orderStatuses).toContain(originalStatus);

        console.log(`Current Status of Order ID ${orderId}: ${originalStatus}`);
    });

    test('should update order status to a new valid status', async () => {
       
        const availableStatuses = orderStatuses.filter(status => status !== originalStatus);
        expect.soft(availableStatuses.length).toBe(orderStatuses.length - 1);

        const newStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
        await statusUpdater.updateOrderStatusInSheet(orderId, newStatus);

        const storedOrder = updatedOrders.find(order => order.id === orderId);
        expect.soft(storedOrder.status).toBe(newStatus);
        expect.soft(storedOrder.status).not.toBe(originalStatus);

        console.log(`Updated status from ${originalStatus} to ${newStatus}`);
        console.log('Updated Orders Array:', updatedOrders);
    });

    test('should validate status update in WooCommerce', async () => {
        
        const storedOrder = updatedOrders[0];

        const wooOrder = await statusUpdater.fetchOrderFromWooCommerce(storedOrder.id);
        expect.soft(wooOrder.id).toBe(Number(storedOrder.id));
        
        const expectedWooStatus = storedOrder.status.replace('wc-', '');
        expect.soft(wooOrder.status).toBe(expectedWooStatus);
        expect.soft(wooOrder.status).not.toBe(originalStatus.replace('wc-', ''));

        console.log(`Verified WooCommerce status for Order ID ${storedOrder.id}: ${wooOrder.status}`);
    });

    test('should bulk update and verify status for first 10 orders', async () => {
        updatedOrders.length = 0;
        
        const orders = await statusUpdater.fetchOrders('Orders!A2:C11');
        expect(orders.length).toBeGreaterThan(0);
        
        const orderIds = orders.map(order => order[0]);
        const originalStatuses = orders.map(order => order[2]);
        
        const newStatuses = orders.map(order => {
            const currentStatus = order[2];
            const availableStatuses = orderStatuses.filter(status => status !== currentStatus);
            return availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
        });
        
        for (let i = 0; i < orders.length; i++) {
            const orderId = orderIds[i];
            const newStatus = newStatuses[i];
            const rowIndex = i + 2;
            
            console.log(`Updating order ${orderId} from ${originalStatuses[i]} to ${newStatus}`);
            
            await statusUpdater.updateOrderStatusInSheet(orderId, newStatus, rowIndex);
            
            const storedOrder = updatedOrders.find(order => order.id === orderId);
            expect(storedOrder, `Order ${orderId} not found in updatedOrders`).toBeDefined();
            expect(storedOrder.status, `Status mismatch for order ${orderId}`).toBe(newStatus);
        }
        
        for (let i = 0; i < orderIds.length; i++) {
            const orderId = orderIds[i];
            const expectedStatus = newStatuses[i].replace('wc-', '');
            
            const wooOrder = await statusUpdater.fetchOrderFromWooCommerce(orderId);
            expect.soft(wooOrder.id, `Order ID mismatch for ${orderId}`).toBe(Number(orderId));
            expect.soft(wooOrder.status, `Status mismatch in WooCommerce for order ${orderId}`).toBe(expectedStatus);
            
            console.log(`Verified update for Order ${orderId}: ${expectedStatus}`);
        }
        
        console.log(`Successfully updated and verified ${orderIds.length} orders`);
    });
});