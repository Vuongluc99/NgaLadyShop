const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Steve1999qd',
    database: 'NgaLady_shop'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Kết nối thất bại:', err);
        return;
    }
    console.log('✅ Kết nối MySQL thành công!');
});

module.exports = connection;
