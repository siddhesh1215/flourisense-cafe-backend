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
    ReferenceType,
    Location,
    Menu,
    LocationMenuItem
} = require('../models');

const bcrypt = require('bcrypt');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // ═══════════════════════════════════════
        // SAFE SYNC — does NOT reset existing data
        // ═══════════════════════════════════════
        await sequelize.sync({ force: false });
        console.log('✅ Database synced (safe, existing data preserved)\n');


        // ─── Reference Types ───────────────────────────────────────────────────
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

        // ─── Roles ─────────────────────────────────────────────────────────────
        const [superAdminRole] = await Reference.findOrCreate({
            where: { name: 'super_admin' },
            defaults: {
                code: 'SUPER_ADMIN',
                reference_type_id: roleType.id
            }
        });

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

        console.log('✅ Roles created (super_admin, admin, user)\n');

        // ─── Order Status ──────────────────────────────────────────────────────
        await Reference.findOrCreate({
            where: { name: 'pending' },
            defaults: {
                code: 'pending',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'confirmed' },
            defaults: {
                code: 'confirmed',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'preparing' },
            defaults: {
                code: 'preparing',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'processing' },
            defaults: {
                code: 'processing',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'served' },
            defaults: {
                code: 'served',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'completed' },
            defaults: {
                code: 'completed',
                reference_type_id: orderStatusType.id
            }
        });

        await Reference.findOrCreate({
            where: { name: 'cancelled' },
            defaults: {
                code: 'cancelled',
                reference_type_id: orderStatusType.id
            }
        });

        console.log('✅ Order status ready (pending, confirmed, preparing, served, completed, cancelled)\n');

        // ─── Users ─────────────────────────────────────────────────────────────
        const superAdminPassword = await bcrypt.hash('superadmin123', 8);
        await User.findOrCreate({
            where: { email: 'superadmin@flourisense.com' },
            defaults: {
                name: 'Super Admin',
                email: 'superadmin@flourisense.com',
                phone: '+91-9000000000',
                password: superAdminPassword,
                is_verified: true,
                role_id: superAdminRole.id,
                created_on: new Date(),
                updated_on: new Date()
            }
        });
        console.log('🦸 Super Admin created: superadmin@flourisense.com / superadmin123\n');

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

        // ─── Locations ─────────────────────────────────────────────────────────
        const [mumbaiLocation] = await Location.findOrCreate({
            where: { code: 'MUM' },
            defaults: {
                name: 'Mumbai',
                code: 'MUM',
                address: 'Bandra West, Mumbai',
                city: 'Mumbai',
                inactive: false
            }
        });

        const [puneLocation] = await Location.findOrCreate({
            where: { code: 'PUN' },
            defaults: {
                name: 'Pune',
                code: 'PUN',
                address: 'Koregaon Park, Pune',
                city: 'Pune',
                inactive: false
            }
        });

        console.log('📍 Locations created (Mumbai, Pune)\n');

        // ─── Menus (one per location) ───────────────────────────────────────────
        const [mumbaiMenu] = await Menu.findOrCreate({
            where: { location_id: mumbaiLocation.id, name: 'Mumbai Main Menu' },
            defaults: {
                description: 'Main menu for the Mumbai branch',
                location_id: mumbaiLocation.id,
                is_active: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [puneMenu] = await Menu.findOrCreate({
            where: { location_id: puneLocation.id, name: 'Pune Main Menu' },
            defaults: {
                description: 'Main menu for the Pune branch',
                location_id: puneLocation.id,
                is_active: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('📋 Menus created (Mumbai Main Menu, Pune Main Menu)\n');

        // ─── Menu Categories ────────────────────────────────────────────────────
        const [coffee] = await MenuCategory.findOrCreate({
            where: { name: 'Coffee' },
            defaults: {
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [snacks] = await MenuCategory.findOrCreate({
            where: { name: 'Snacks' },
            defaults: {
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [desserts] = await MenuCategory.findOrCreate({
            where: { name: 'Desserts' },
            defaults: {
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('🗂 Menu categories created (Coffee, Snacks, Desserts)\n');

        // ─── Menu Items ─────────────────────────────────────────────────────────
        // Items available at BOTH Mumbai & Pune
        const [cappuccino] = await MenuItem.findOrCreate({
            where: { name: 'Cappuccino' },
            defaults: {
                description: 'Classic espresso with steamed milk foam',
                emoji: '☕',
                price: 120,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [latte] = await MenuItem.findOrCreate({
            where: { name: 'Café Latte' },
            defaults: {
                description: 'Smooth espresso with silky steamed milk',
                emoji: '🥛',
                price: 130,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [coldBrew] = await MenuItem.findOrCreate({
            where: { name: 'Cold Brew' },
            defaults: {
                description: 'Slow-steeped cold brew coffee served over ice',
                emoji: '🧊',
                price: 150,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [croissant] = await MenuItem.findOrCreate({
            where: { name: 'Butter Croissant' },
            defaults: {
                description: 'Flaky, golden-baked butter croissant',
                emoji: '🥐',
                price: 90,
                category_id: snacks.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        // Items available ONLY in Mumbai
        const [espresso] = await MenuItem.findOrCreate({
            where: { name: 'Espresso Shot' },
            defaults: {
                description: 'Strong single-origin espresso shot',
                emoji: '⚡',
                price: 80,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [bombaySandwich] = await MenuItem.findOrCreate({
            where: { name: 'Bombay Masala Sandwich' },
            defaults: {
                description: 'Grilled sandwich with spiced potato and chutneys',
                emoji: '🥪',
                price: 110,
                category_id: snacks.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [cuttingChai] = await MenuItem.findOrCreate({
            where: { name: 'Cutting Chai' },
            defaults: {
                description: 'Mumbai-style half-cup spiced tea',
                emoji: '🍵',
                price: 30,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        // Items available ONLY in Pune
        const [filterCoffee] = await MenuItem.findOrCreate({
            where: { name: 'South Indian Filter Coffee' },
            defaults: {
                description: 'Traditional drip-brewed filter coffee with chicory',
                emoji: '☕',
                price: 60,
                category_id: coffee.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [misalPav] = await MenuItem.findOrCreate({
            where: { name: 'Misal Pav' },
            defaults: {
                description: 'Spicy sprouted bean curry served with soft pav',
                emoji: '🌶️',
                price: 95,
                category_id: snacks.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        const [shrewsburyCookie] = await MenuItem.findOrCreate({
            where: { name: 'Shrewsbury Cookie' },
            defaults: {
                description: 'Pune\'s iconic buttery shortbread cookie',
                emoji: '🍪',
                price: 40,
                category_id: desserts.id,
                is_available: true,
                created_on: new Date(),
                updated_on: new Date()
            }
        });

        console.log('🍽 Menu items created\n');

        // ─── LocationMenuItem — Link items to locations ────────────────────────
        // Helper: create LocationMenuItem entry if it doesn't already exist
        // LocationMenuItem schema: location_id, menu_item_id, is_available
        const linkItem = async (locationId, menuItemId, isAvailable = true) => {
            const existing = await LocationMenuItem.findOne({
                where: { location_id: locationId, menu_item_id: menuItemId }
            });
            if (!existing) {
                await LocationMenuItem.create({
                    location_id: locationId,
                    menu_item_id: menuItemId,
                    is_available: isAvailable,
                    created_on: new Date(),
                    updated_on: new Date()
                });
            }
        };

        // ── Items available at BOTH locations ──────────────────────────────────
        for (const item of [cappuccino, latte, coldBrew, croissant]) {
            await linkItem(mumbaiLocation.id, item.id, true);
            await linkItem(puneLocation.id, item.id, true);
        }

        // ── Mumbai-only items ──────────────────────────────────────────────────
        for (const item of [espresso, bombaySandwich, cuttingChai]) {
            await linkItem(mumbaiLocation.id, item.id, true);
        }

        // ── Pune-only items ────────────────────────────────────────────────────
        for (const item of [filterCoffee, misalPav, shrewsburyCookie]) {
            await linkItem(puneLocation.id, item.id, true);
        }

        console.log('📌 Location-specific menu availability configured\n');
        console.log('   ✅ Both Mumbai & Pune : Cappuccino, Café Latte, Cold Brew, Butter Croissant');
        console.log('   🟠 Mumbai only        : Espresso Shot, Bombay Masala Sandwich, Cutting Chai');
        console.log('   🟣 Pune only          : South Indian Filter Coffee, Misal Pav, Shrewsbury Cookie\n');

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