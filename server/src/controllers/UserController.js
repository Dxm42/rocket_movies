const AppError = require("../utils/AppError")

class UserController {
  create(request, response) {
    const { name, email, password } = request.body
  
    if(!name ){
      throw new AppError("Name is required")
    }

    response.json({name, email, password})
  }
}

module.exports = UserController