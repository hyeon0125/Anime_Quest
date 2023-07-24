const mysql = require('mysql2/promise');

const regex_html = /<[^>]*>/g; // HTML 태그를 찾는 정규표현식
const regex_gen = /\d+기/; // ~ 기
const regex_genfilm = /\d기 극장판/; //~기 극장판
const regex_cc = /\(자막\)/;
const regex_ova = /OVA/;
const regex_vr = /\(더빙\)/;
const regex_kb = /\(국내 미방영분\)/;
const regex_ge = /\d{1,2}$/;
const regex_season= /시즌 \d+/;
const regex_filegen= /극장판 \d+기/;
const regex_series = /시리즈/;
const regex_tvseries=/TV 시리즈 \d+기/;

// MySQL 데이터베이스에 연결
const connection = mysql.createPool({
    host: '211.37.148.55',
    user: 'access_client',
    password: 'qwe123QWE!@#',
    database: 'Anime_Quest'
});

async function modifyAndInsert() {
    const [rows] = await connection.query("SELECT * FROM AnimeDB");
    const updatedRows = rows.map(row => {
        let name = row.NAME;
        name = name.replace(regex_html, '');
        name = name.replace(regex_gen, '');
        name = name.replace(regex_genfilm, '');
        name = name.replace(regex_cc, '');
        name = name.replace(regex_ova, '');
        name = name.replace(regex_vr, '');
        name = name.replace(regex_kb, '');
        name = name.replace(regex_ge, '');
        name = name.replace(regex_season, '');
        name = name.replace(regex_filegen, '');
        name = name.replace(regex_series, '');
        name = name.replace(regex_tvseries, '');
        return {...row, NAME: name};
    });

    for (const row of updatedRows) {
        await connection.query("INSERT INTO AnimeDB_Final SET ?", row);
    }

    console.log('Data insertion into AnimeDB_Final is complete.');
}

modifyAndInsert().catch(console.error);