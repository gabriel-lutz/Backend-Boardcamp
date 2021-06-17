import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const {Pool} = pg;
const connection  = new Pool(
    {
        user: 'bootcamp_role',
        password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
        host: 'localhost',
        port: 5432,
        database: 'boardcamp'
    }
);

app.get('/categories', async (req,res)=>{
    try{
        const query = await connection.query('SELECT * FROM categories')
        res.send(query.rows)
    }catch(err){
        console.log(err)
        res.send(500)
    }
})

app.post('/categories', async (req,res)=>{
    try{
        const newCategorie = req.body.name
        const query = await connection.query('SELECT * FROM categories')
        if(!newCategorie.length){
            res.send(400)
            return;
        }else if(query.rows.length && query.rows.find(q => q.name === newCategorie)){
            res.send(409);
            return
        }
        await connection.query(`
            INSERT INTO categories (name) 
            VALUES ($1)`, [newCategorie])
        res.send(201)
    }catch(err){
        console.log(err)
        res.send(500)
    }
})

app.get('/games', async (req,res)=>{
    try{
        const gamesToFilter = req.query.name
        if(gamesToFilter){
            const query = await connection.query(`
                SELECT games.*, categories.name AS "categoryName" 
                FROM games JOIN categories
                ON games."categoryId" = categories.id
                WHERE name iLIKE  $1 || '%' `, [gamesToFilter])
            res.send(query.rows)
        }else{
            const query = await connection.query(`
                SELECT games.*, categories.name AS "categoryName" 
                FROM games JOIN categories
                ON games."categoryId" = categories.id`)
            res.send(query.rows)
        }
    }catch(err){
        console.log(err)
        res.send(500)
    }
})

app.post('/games', async (req,res)=>{
    try{
        const {name, image, stockTotal, categoryId, pricePerDay} = req.body
        const gamesQuery = await connection.query(`
            SELECT * 
            FROM games 
            WHERE name = $1`, [name])
        const categoriesQuery = await connection.query('SELECT * FROM categories')
        if(!name.length || stockTotal<=0 || pricePerDay <=0 || !categoriesQuery.rows.some(c=>c.id === categoryId)){
            res.send(401)
            return;
        }else if(gamesQuery.rows.length){
            res.send(409)
            return;
        }
        const query = await connection.query(`
            INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
            VALUES ($1, $2, $3, $4, $5)`, [name, image, stockTotal, categoryId, pricePerDay])
        res.send(200)
    }catch(err){
        console.log(err)
    }
})

app.get('/customers', async (req,res)=>{
    try{
        const cpfToFilter = req.query.cpf
        if(cpfToFilter){
            const query = await connection.query(`
                SELECT * FROM customers 
                WHERE cpf = $1
            `, [cpfToFilter+'%'])
            res.send(query.rows)
        }else{
            const query = await connection.query(`
                SELECT * FROM customers
            `)
            res.send(query.rows)
        }
    }catch(err){
        console.log(err)
        res.send(500)
    }
})


app.listen(4000, ()=>{
    console.log("O servidor está rodando na porta 4000...")
});