const { test, expect } = require("@playwright/test");
const { CreateOrder, ordersData } = require("../pages/createWcOrder");

test.describe("WooCommerce Order Creation and Validation on Google Sheets", () => {
    let createOrderInstance;
    let createdOrders = [];

    test.beforeAll(() => {
        createOrderInstance = new CreateOrder("./tests/utilities/upload_key.json");
    });

    test("Create a new order using WooCommerce API", async () => {
        const order = await createOrderInstance.createOrder();
        expect(order.id).toBeDefined();
        createdOrders.push(order);
    });

    test("Verify that the order exists in Google Sheets", async () => {
        const orderInfo = await createOrderInstance.validateOrderOnGoogleSheet(createdOrders[0].id);
    
        console.log("Google Sheet Order Info:", orderInfo);
        console.log("Created Orders Array:", createdOrders);
    
        if (orderInfo) {
            const storedOrder = ordersData.find(order => order.id === Number(orderInfo[0]));
            expect.soft(storedOrder).toBeDefined();
    
            const [
                id,
                productNames,
                orderStatus,
                totalItems,
                sku,
                totalPrice,
                totalDiscount,
                billingDetails,
                shippingDetails,
                orderDate,
                paymentMethod,
                customerNote,
                orderPlacedBy,
                orderUrl,
                orderNote
            ] = orderInfo;
    
            expect.soft(storedOrder.id).toBe(Number(id));
            expect.soft(storedOrder.product_names).toBe(productNames);
            expect.soft(storedOrder.status).toBe(orderStatus);
            expect.soft(storedOrder.total_items).toBe(Number(totalItems));
            expect.soft(storedOrder.sku).toBe(sku);
            expect.soft(storedOrder.total_price).toBe(totalPrice);
            expect.soft(storedOrder.total_discount).toBe(totalDiscount);
            const [billingFirstName, billingLastName, billingAddress, billingEmail, billingPhone] = billingDetails.split("|");
            expect.soft(storedOrder.billing.first_name).toBe(billingFirstName);
            expect.soft(storedOrder.billing.last_name).toBe(billingLastName);
            expect.soft(storedOrder.billing.address).toBe(billingAddress);
            expect.soft(storedOrder.billing.email).toBe(billingEmail);
            expect.soft(storedOrder.billing.phone).toBe(billingPhone);
            const [shippingFirstName, shippingLastName, shippingAddress, shippingPhone] = shippingDetails.split("|");
            expect.soft(storedOrder.shipping.first_name).toBe(shippingFirstName);
            expect.soft(storedOrder.shipping.last_name).toBe(shippingLastName);
            expect.soft(storedOrder.shipping.address).toBe(shippingAddress);
            expect.soft(storedOrder.shipping.phone).toBe(shippingPhone);
            expect.soft(storedOrder.order_date).toBe(orderDate);
            expect.soft(storedOrder.payment_method).toBe(paymentMethod);
            expect.soft(storedOrder.customer_note).toBe(customerNote);
            expect.soft(storedOrder.order_placed_by).toBe(orderPlacedBy);
            expect.soft(storedOrder.order_url).toBe(orderUrl);
            expect.soft(storedOrder.order_note).toBe(orderNote);

            expect(test.info().errors).toHaveLength(0);
        }
    });
    
});
