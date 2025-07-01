const { faker } = require('@faker-js/faker');

function generateRandomOrderData(product) {
    return {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: true,
        billing: {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            address_1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            postcode: faker.location.zipCode(),
            country: 'US',
            email: faker.internet.email(),
            phone: faker.phone.number(),
        },
        shipping: {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            address_1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            postcode: faker.location.zipCode(),
            country: 'US',
        },
        line_items: [
            {
                product_id: product.id,
                quantity: 1,
            },
        ],
    };
}

module.exports = { generateRandomOrderData };
