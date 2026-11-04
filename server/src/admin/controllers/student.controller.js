const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authSessionService = require('../services/authSession.service');
const authUtils = require('../../utils/auth.utils');
const bcrypt = require('bcryptjs');
const menu = require('./menu.static.controller');
const page_utils = require('../../utils/page.utils');

async function modifyStudent(req, res){
        const email = req.body?.email ?? "";
        const role = req.body?.role ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
	const variable = req.body?.variable ?? "";
        const action = req.body?.action ?? "";
	const studentid= req.body?.studentid ?? "";
	const newval = req.body?.newval ?? "";
	const subval = req.body?.subval ?? "";
	if(newval == "" || subval != newval)return res.status(401).send("Values must match")
        if(role != "ADMINISTRATOR"){
                return res.status(401).send("INVALID ROLE INPUT")
        }
	if(studentid == "")return res.status(401).send("INVALID STUDENT ID")
	if(variable == "")return res.status(401).send("INVALID VARIABLE")
        if(action == "")return res.status(401).send("INVALID ACTION")
	if(authUtils.check_token(req, res) == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/")
	const student = prisma.student.findUnique({
		where: {id: studentid}
	})
	if(!student)return res.status(402).send("No student with id: " + studentid)
	if(action != "Change"){
		const studentCount = await prisma.student.count();
        	const maxPage = Math.floor(studentCount/10) + (Math.floor(studentCount/10) == 0)?0:1;
                        var students = await prisma.student.findMany({
                                take: 10,
                                orderBy:{
                                        name: "desc"
                                }
                        });
        	return res.render("admin/student_menu", {token, email, role, maxPage, students, id, page: 1, pageSize: 10, count:studentCount})

	}
	switch(variable){
	case "E-Mail":{
		const updated = await prisma.student.update({
			where: {id: studentid},
			data: {
				email: String(newval)
			}
		});
		break;
	}
	case "Name":
		const updated = await prisma.student.update({
                        where: {id: studentid},
                        data: {
                                name: String(newval)
                        }
                });
		break;
	case "Password":{
		const hash = await bcrypt.hash(newval, 12)
		const updated = await prisma.student.update({
                        where: {id: studentid},
                        data: {
                                password: String(hash)
                        }
                });
		break;
	}
	default:{
		return res.status(403).send("Invalid variable type")
	}
	}
	const studentCount = await prisma.student.count();
        const maxPage = Math.floor(studentCount/10) + (Math.floor(studentCount/10) == 0)?0:1;
                        var students = await prisma.student.findMany({
                                take: 10,
                                orderBy:{
                                        name: "desc"
                                }
                        });
	let i = 0;
                        while(i < students.length){
                                students[i].courses = await prisma.studentEnrollment.findMany({
                                        where:{
                                                studentId: students[i].id
                                        }
                                })
                                students[i].badges = await prisma.studentBadge.findMany({
                                        where:{
                                                studentId: students[i].id
                                        }
                                })
                                i++
                        }

        return res.render("admin/student_menu", {token, email, role, maxPage, students, id, page: 1, pageSize: 10, count:studentCount})


}

async function editStudent(req, res) {
        const email = req.body?.email ?? "";
        const role = req.body?.role ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
        const action = req.body?.action ?? "";
	const studentid = req.body?.studentid ?? "";
	if(studentid == "")return res.status(401).send("No student id")
        if(role != "ADMINISTRATOR"){
                return res.status(401).send("INVALID ROLE INPUT")
        }
        if(action == "")return res.status(401).send("INVALID ACTION")
	const isAuth = await authUtils.check_token(req, res)
	if(isAuth == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/")

	const student = await prisma.student.findUnique({
		where:{
			id:studentid
		}
	})
	if(!student)return res.status(401).send("No Student")
	switch(action){
	case "Change E-Mail":
	case "Change Name":
	case "Change Password":{
		return res.render("admin/student_modify", {
			token, email, id, role, action,
			student, variable: action.split(" ")[1]
		})
	}
	}
}
async function getStudents(req, res) {
	const email = req.body?.email ?? "";
        const role = req.body?.role ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
        const action = req.body?.action ?? "";
	var page = req.body?.page ?? 1;
	page = Number(page)
	var pageSize = req.body?.pageSize ?? 10;
	pageSize = Number(pageSize)
        if(role != "ADMINISTRATOR"){
                return res.status(401).send("INVALID ROLE INPUT")
        }
        if(action == "")return res.status(401).send("INVALID ACTION")
        const isAuth = await authUtils.check_token(req, res)
        if(isAuth == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/")
        const studentCount = await prisma.student.count();
        const maxPage = Math.ceil(studentCount/pageSize);
	if(page > maxPage) page = maxPage
	if(page < 1) page = 1
	switch(action){
        case "PREVIOUS":{
		if(page > 1)page = page -1
		break;
	}
        case "NEXT":
		if(page < maxPage)page = page+1
		break;
        default:{
		return res.render("admin/main_menu", {token, email, role, id});
        }
        }
	var students = await prisma.student.findMany({
                                take: 10,
				skip: 10*(page-1),
                                orderBy:{
                                        name: "desc"
                                }
                        });
                        let i = 0;
			while(i < students.length){
                                students[i].courses = await prisma.studentEnrollment.findMany({
                                        where:{
                                                studentId: students[i].id
                                        }
                                })
                                students[i].badges = await prisma.studentBadge.findMany({
                                        where:{
                                                studentId: students[i].id
                                        }
                                })
                                i++
                        }
                        return res.render("admin/student_menu", {token, email, role, maxPage, students, id, page, pageSize, count:studentCount})
}

module.exports = {modifyStudent, editStudent, getStudents};
