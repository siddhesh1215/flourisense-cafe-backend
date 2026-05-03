/**
 * Database Seed Script
 */

const {
    sequelize,
    User,
    Reference,
    MenuCategory,
    MenuItem,
    Order,
    Review,
    ReferenceType
} = require('../models');

const bcrypt = require('bcrypt');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // ═══════════════════════════════════════
        // RESET DATABASE (IMPORTANT FIX)
        // ═══════════════════════════════════════
        await sequelize.sync({ force: true });
        console.log('✅ Database synced (FORCE RESET)\n');

        // Reference Types
        const [roleType] = await ReferenceType.findOrCreate({
            where: { name: 'role' },
            defaults: {}
        });

        const [orderStatusType] = await ReferenceType.findOrCreate({
            where: { name: 'order_status' },
            defaults: {}
        });

        const [orderTypeType] = await ReferenceType.findOrCreate({
            where: { name: 'order_type' },
            defaults: {}
        });

        console.log('✅ Reference Types ready\n');

        // Roles
        const [adminRole] = await Reference.findOrCreate({
            where: { name: 'admin' },
            defaults: {
                code: 'ADMIN',
                reference_type_id: roleType.id
            }
        });

        const [userRole] = await Reference.findOrCreate({
            where: { name: 'user' },
            defaults: {
                code: 'USER',
                reference_type_id: roleType.id
            }
        });

        console.log('✅ Roles created\n');

        // Order Status
        const [pendingStatus] = await Reference.findOrCreate({
            where: { name: 'pending' },
            defaults: {
                code: 'PENDING',
                reference_type_id: orderStatusType.id
            }
        });

        const [processingStatus] = await Reference.findOrCreate({
            where: { name: 'processing' },
            defaults: {
                code: 'PROCESSING',
                reference_type_id: orderStatusType.id
            }
        });

        const [completedStatus] = await Reference.findOrCreate({
            where: { name: 'completed' },
            defaults: {
                code: 'COMPLETED',
                reference_type_id: orderStatusType.id
            }
        });

        console.log('✅ Order status ready\n');

        // Admin User
        const adminPassword = await bcrypt.hash('admin123', 8);

        await User.findOrCreate({
            where: { email: 'admin@flourisense.com' },
            defaults: {
                name: 'Admin User',
                email: 'admin@flourisense.com',
                phone: '+91-9999999999',
                password: adminPassword,
                is_verified: true,
                role_id: adminRole.id,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('👑 Admin created: admin@flourisense.com / admin123\n');

        // Test Users
        const userPassword = await bcrypt.hash('customer123', 8);

        await User.findOrCreate({
            where: { email: 'john@example.com' },
            defaults: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+91-9876543210',
                password: userPassword,
                is_verified: true,
                role_id: userRole.id,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('👥 Test users created\n');

        // Menu Categories
        const [coffee] = await MenuCategory.findOrCreate({
            where: { name: 'Coffee' },
            defaults: {
                description: 'Coffee drinks',
                display_order: 1,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        // Menu Items
        await MenuItem.findOrCreate({
            where: { name: 'Cappuccino' },
            defaults: {
                name: 'Cappuccino',
                description: 'Classic coffee',
                emoji: '☕',
                price: 120,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('🍽 Menu seeded\n');

        console.log('═══════════════════════════════════════');
        console.log('✅ SEED COMPLETED SUCCESSFULLY');
        console.log('═══════════════════════════════════════');

        console.log('\n🔑 Admin Login:');
        console.log('Email: admin@flourisense.com');
        console.log('Password: admin123\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error);
        await sequelize.close().catch(() => {});
        process.exit(1);
    }
};

seedDatabase();
