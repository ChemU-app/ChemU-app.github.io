const jwt = require('jsonwebtoken');

function check_token(req, res){
	const email = req.body?.email ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
	
	if(email.trim() == ""){
                return false
        }
        if(token == "") return false
        if(id == "") return false
        try{
                jwt.verify(token, process.env.JWT_SECRET);
        }catch{
                console.error("BAD TOKEN")
		return false;
        }


	return true
};


module.exports = {check_token};
