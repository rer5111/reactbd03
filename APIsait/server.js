const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Проверка подключения
pool.on('connect', () => {
    console.log('Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
    console.error('Ошибка подключения к PostgreSQL:', err);
});

// Простой тестовый endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!', timestamp: new Date() });
});

// Простой запрос к БД без JOIN
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({ 
            message: 'Подключение к БД работает!',
            current_time: result.rows[0].current_time
        });
    } catch (error) {
        console.error('Ошибка теста БД:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/roles', async (req, res) => {
    try {
        const { title } = req.body;
        console.log(`Создание роли: ${title}`);
        const result = await pool.query(
            'INSERT INTO roles (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания роли:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (ALL)
app.get('/api/roles', async (req, res) => {
    try {
        console.log('Запрос всех ролей...');
        const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения ролей:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY ID)
app.get('/api/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос роли с id: ${id}`);
        const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Роль не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения роли:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        console.log(`Обновление роли id: ${id} -> ${title}`);
        const result = await pool.query(
            'UPDATE roles SET title = $1 WHERE id = $2 RETURNING *',
            [title, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Роль не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление роли id: ${id}`);
        const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Роль не найдена' });
        res.json({ message: 'Роль успешно удалена', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления роли:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/users', async (req, res) => {
    try {
        const { email, pass, roleID } = req.body;
        console.log(`Создание пользователя: ${email}`);
        const result = await pool.query(
            'INSERT INTO users (email, pass, roleID) VALUES ($1, $2, $3) RETURNING *',
            [email, pass, roleID]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/users', async (req, res) => {
    try {
        console.log('Запрос всех пользователей...');
        const result = await pool.query(`
            SELECT u.id, u.email, u.pass, u.roleID, r.title as role_title 
            FROM users u
            JOIN roles r ON u.roleID = r.id
            ORDER BY u.id ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY ID)
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос пользователя с id: ${id}`);
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (LOGIN)
app.post('/api/users/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        console.log(`Попытка войти в аккаунт ${login}`);
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND pass = $2', [login, password]);
        if (result.rows.length === 0) return res.json({ message: 'Неправильный логин или пароль.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка попытки входа: ', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, pass, roleID } = req.body;
        console.log(`Обновление пользователя id: ${id}`);
        const result = await pool.query(
            'UPDATE users SET email = $1, pass = $2, roleID = $3 WHERE id = $4 RETURNING *',
            [email, pass, roleID, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление пользователя id: ${id}`);
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json({ message: 'Пользователь успешно удален', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        res.status(500).json({ error: error.message });
    }
});
// CREATE
app.post('/api/categories', async (req, res) => {
    try {
        const { title } = req.body;
        console.log(`Создание категории: ${title}`);
        const result = await pool.query(
            'INSERT INTO categories (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания категории:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/categories', async (req, res) => {
    try {
        console.log('Запрос всех категорий...');
        const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY ID)
app.get('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос категории с id: ${id}`);
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Категория не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения категории:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        console.log(`Обновление категории id: ${id}`);
        const result = await pool.query(
            'UPDATE categories SET title = $1 WHERE id = $2 RETURNING *',
            [title, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Категория не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления категории:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление категории id: ${id}`);
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Категория не найдена' });
        res.json({ message: 'Категория успешно удалена', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/shoes', async (req, res) => {
    try {
        const { title, cost, categoryId, globalDiscount, img} = req.body;
        console.log(`Создание ботинка: ${title}`);
        const result = await pool.query(
            'INSERT INTO shoes (title, cost, category_id, global_discount, img) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, cost, categoryId, globalDiscount, img]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания ботинка:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/shoes', async (req, res) => {
    try {
        console.log('Запрос всех ботинков...');
        const result = await pool.query('SELECT * FROM shoes ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения ботинков:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY ID)
app.get('/api/shoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос ботинка с id: ${id}`);
        const result = await pool.query('SELECT * FROM shoes WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ботинок не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения ботинка:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/shoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, cost, categoryId, globalDiscount, img} = req.body;
        console.log(`Обновление ботинка с id: ${id}`);
        const result = await pool.query(
            'UPDATE shoes SET title = $1, cost = $2, category_id = $3, global_discount = $4, img = $5 WHERE id = $6 RETURNING *',
            [title, cost, categoryId, globalDiscount, img, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ботинок не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления ботинка:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/shoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление ботинка с id: ${id}`);
        const result = await pool.query('DELETE FROM shoes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ботинок не найден' });
        res.json({ message: 'Ботинок успешно удален', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления ботинка:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/discounts', async (req, res) => {
    try {
        const { ownerId, shoeId, discount} = req.body;
        console.log(`Создание скидки на ботинок с id ${shoeId} пользователю с id ${ownerId}}`);
        const result = await pool.query(
            'INSERT INTO discount_info (owner_id, shoe_id, discount) VALUES ($1, $2, $3) RETURNING *',
            [ownerId, shoeId, discount]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания скидки:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/discounts', async (req, res) => {
    try {
        console.log('Запрос всех скидок...');
        const result = await pool.query('SELECT * FROM discount_info ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения скидок:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY owner_id)
app.get('/api/discounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос скидок с owner_id: ${id}`);
        const result = await pool.query('SELECT * FROM discount_info WHERE owner_id = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения скидок:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/discounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId, shoeId, discount} = req.body;
        console.log(`Обновление скидки с id: ${id}`);
        const result = await pool.query(
            'UPDATE discount_info SET owner_id = $1, shoe_id = $2, discount = $3 WHERE id = $4 RETURNING *',
            [ownerId, shoeId, discount, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Скидка не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления скидки:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/discounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление скидки с id: ${id}`);
        const result = await pool.query('DELETE FROM discount_info WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Скидка не найдена' });
        res.json({ message: 'Скидка успешно удалена', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления скидки:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/carts', async (req, res) => {
    try {
        const { ownerId, shoeId, amnt} = req.body;
        console.log(`Создание предмета в корзине с ботинком с id ${shoeId} пользователю с id ${ownerId}}`);
        const result = await pool.query(
            'INSERT INTO carts (owner_id, shoe_id, amnt) VALUES ($1, $2, $3) RETURNING *',
            [ownerId, shoeId, amnt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания предмета:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/carts', async (req, res) => {
    try {
        console.log('Запрос всех предметов в корзине...');
        const result = await pool.query('SELECT * FROM carts ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения предметов:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY owner_id)
app.get('/api/carts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос предметов с owner_id: ${id}`);
        const result = await pool.query('SELECT * FROM carts WHERE owner_id = $1 ORDER BY id ASC', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения предметов:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/carts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId, shoeId, amnt} = req.body;
        console.log(`Обновление предмета в корзине с id: ${id}`);
        const result = await pool.query(
            'UPDATE carts SET owner_id = $1, shoe_id = $2, amnt = $3 WHERE id = $4 RETURNING *',
            [ownerId, shoeId, amnt, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Предмет не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления предмета:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/carts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление предмета в корзине с id: ${id}`);
        const result = await pool.query('DELETE FROM carts WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Предмет не найден' });
        res.json({ message: 'Корзина успешно удалена', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления предмета:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE
app.post('/api/purchases', async (req, res) => {
    try {
        const { ownerId, shoeId, amnt} = req.body;
        console.log(`Создание покупки ботинка с id ${shoeId} пользователю с id ${ownerId}}`);
        const result = await pool.query(
            'INSERT INTO purchases (owner_id, shoe_id, amnt) VALUES ($1, $2, $3) RETURNING *',
            [ownerId, shoeId, amnt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания покупки:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ
app.get('/api/purchases', async (req, res) => {
    try {
        console.log('Запрос всех покупок...');
        const result = await pool.query('SELECT * FROM purchases ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения покупок:', error);
        res.status(500).json({ error: error.message });
    }
});

// READ (BY owner_id)
app.get('/api/purchases/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос покупок с owner_id: ${id}`);
        const result = await pool.query('SELECT * FROM purchases WHERE owner_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Покупки не найдены' });
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения покупок:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
app.put('/api/purchases/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId, shoeId, amnt} = req.body;
        console.log(`Обновление покупки в корзине с id: ${id}`);
        const result = await pool.query(
            'UPDATE purchases SET owner_id = $1, shoe_id = $2, amnt = $3 WHERE id = $4 RETURNING *',
            [ownerId, shoeId, amnt, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Покупка не найдена' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления покупки:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/api/purchases/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Удаление покупки с id: ${id}`);
        const result = await pool.query('DELETE FROM purchases WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Покупка не найдена' });
        res.json({ message: 'Покупка успешно удалена', deleted: result.rows[0] });
    } catch (error) {
        console.error('Ошибка удаления покупки:', error);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log('Тестовые endpoints:');
    console.log(`1) http://localhost:${PORT}/api/test`);
    console.log(`2) http://localhost:${PORT}/api/test-db`);
    console.log(`3) http://localhost:${PORT}/api/roles/1`);
    console.log(`4) http://localhost:${PORT}/api/users`);
});