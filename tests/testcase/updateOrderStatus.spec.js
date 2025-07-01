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
        expect(firstOrder.length).toBeGreaterThan(2);
        [orderId, , originalStatus] = firstOrder;
        expect(orderStatuses).toContain(originalStatus);

        console.log(`Current Status of Order ID ${orderId}: ${originalStatus}`);
    });

    test('should update order status to a new valid status', async () => {
       
        const availableStatuses = orderStatuses.filter(status => status !== originalStatus);
        expect(availableStatuses.length).toBe(orderStatuses.length - 1);

        const newStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
        await statusUpdater.updateOrderStatusInSheet(orderId, newStatus);

        const storedOrder = updatedOrders.find(order => order.id === orderId);
        expect(storedOrder.status).toBe(newStatus);
        expect(storedOrder.status).not.toBe(originalStatus);

        console.log(`Updated status from ${originalStatus} to ${newStatus}`);
        console.log('Updated Orders Array:', updatedOrders);
    });

    test('should validate status update in WooCommerce', async () => {
        
        const storedOrder = updatedOrders[0];

        const wooOrder = await statusUpdater.fetchOrderFromWooCommerce(storedOrder.id);
        expect(wooOrder.id).toBe(Number(storedOrder.id));
        
        const expectedWooStatus = storedOrder.status.replace('wc-', '');
        expect(wooOrder.status).toBe(expectedWooStatus);
        expect(wooOrder.status).not.toBe(originalStatus.replace('wc-', ''));

        console.log(`Verified WooCommerce status for Order ID ${storedOrder.id}: ${wooOrder.status}`);
    });
});