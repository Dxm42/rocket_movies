const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")
const bcrypt = require("bcrypt")
class UserController {
 async  create(request, response) {
    const { name, email, password } = request.body
  
    const database = await sqliteConnection()

    const checkUserExist = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if(checkUserExist){
      throw new AppError("Este email já está em uso")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",[name,email,hashedPassword])
   return response.status(201).json()
  }

  async update(request, response){
    const {name, email, password, old_password} = request.body
    const { id } = request.params

    const database = await sqliteConnection()

    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

    if(!user){
      throw new AppError("Usuário nao encontrado")
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError("Este email Já está em uso")
    }
    
    user.name = name ?? user.name
    user.email = email ?? user.email 
    
    if(password && !old_password){
      throw new AppError("Voçẽ precisa informas a senha antiga para definir um anova")
    }
    
    if(password && old_password){
        const checkOldPassword = await bcrypt.compare(old_password, user.password)

        if(!checkOldPassword){
          throw new AppError("A senha antiga não confere.")
        }
        user.password = await bcrypt.hash(password, 10)
    }

    await database.run(`
    UPDATE users SET 
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ?`,[user.name, user.email, user.password, id])

    return response.status(200).json()
  }
}

module.exports = UserController