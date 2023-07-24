const request = require('request');
const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: '211.37.148.55',
    user: 'access_client',
    password: 'qwe123QWE!@#',
    database: 'TEST'
});

const requestUrl = 'https://pokeapi.co/api/v2/pokemon/';
for(let i=1;i<=1010;i++){
    pokemonUrl = requestUrl+i;
    request.get(pokemonUrl,(err, res, body) =>{
        let pokemon = JSON.parse(body); //파싱
        if(err) { //에러
            console.log('error')
        } else { 
            let name = pokemon.name;
            let type = '';
            pokemon.types.forEach((item, idx) => {
                type = type + item.type.name;
                if (idx + 1 < pokemon.types.length) {
                    type += ', ';
                }
            });
            let abilities = '';
            pokemon.abilities.forEach((item, idx) => {
                abilities = abilities + item.ability.name;
                if (idx + 1 < pokemon.abilities.length) {
                    abilities += ',';
                }
            });  

            const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM pokemon WHERE name = ?;';        

            connection.query(duplicateCheckQuery, [name], (err, results) => {
                if (err) throw err;

                const count = results[0].count;
                if (count === 0) {
                    // 중복 데이터가 없으므로 INSERT 실행
                    const insertQuery = 'INSERT INTO pokemon(name, type, abilities) VALUES (?, ?, ?)';
                    connection.query(insertQuery, [name, type, abilities], (err, results) => {
                        if (err) throw err;
                        console.log('Data inserted successfully:', results);
                    });
                } else {
                    console.log('Skipping duplicate data:', name);
                }
            });
        }   
    })
}
