const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authSessionService = require('../services/authSession.service');
const authUtils = require('../../utils/auth.utils');
const bcrypt = require('bcryptjs');
const menu = require('./menu.static.controller');

async function modifyTeacher(req, res){
        const email = req.body?.email ?? "";
        const role = req.body?.role ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
	const variable = req.body?.variable ?? "";
        const action = req.body?.action ?? "";
	const teacherid= req.body?.teacherid ?? "";
	const newval = req.body?.newval ?? "";
	const subval = req.body?.subval ?? "";
	if(newval == "" || subval != newval)return res.status(401).send("Values must match")
        if(role != "ADMINISTRATOR"){
                return res.status(401).send("INVALID ROLE INPUT")
        }
	if(teacherid == "")return res.status(401).send("INVALID TEACHER ID")
	if(variable == "")return res.status(401).send("INVALID VARIABLE")
        if(action == "")return res.status(401).send("INVALID ACTION")
	if(authUtils.check_token(req, res) == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/index.htm")
	const teacher = prisma.teacher.findUnique({
		where: {id: teacherid}
	})
	if(!teacher)return res.status(402).send("No teacher with id: " + teacherid)
	if(action != "Change"){
		const teacherCount = await prisma.teacher.count();
        	const maxPage = Math.floor(teacherCount/10) + (Math.floor(teacherCount/10) == 0)?0:1;
                        var teachers = await prisma.teacher.findMany({
                                take: 10,
                                orderBy:{
                                        name: "desc"
                                }
                        });
        	return res.render("admin/teacher_menu", {token, email, role, maxPage, teachers, id, page: 1, pageSize: 10, count:teacherCount})

	}
	switch(variable){
	case "E-Mail":{
		const updated = await prisma.teacher.update({
			where: {id: teacherid},
			data: {
				email: String(newval)
			}
		});
		break;
	}
	case "Name":
		const updated = await prisma.teacher.update({
                        where: {id: teacherid},
                        data: {
                                name: String(newval)
                        }
                });
		break;
	case "Password":{
		const hash = await bcrypt.hash(newval, 12)
		const updated = await prisma.teacher.update({
                        where: {id: teacherid},
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
	const teacherCount = await prisma.teacher.count();
        const maxPage = Math.floor(teacherCount/10) + (Math.floor(teacherCount/10) == 0)?0:1;
                        var teachers = await prisma.teacher.findMany({
                                take: 10,
                                orderBy:{
                                        name: "desc"
                                }
                        });
        return res.render("admin/teacher_menu", {token, email, role, maxPage, teachers, id, page: 1, pageSize: 10, count:teacherCount})


}

async function editTeacher(req, res) {
        const email = req.body?.email ?? "";
        const role = req.body?.role ?? "";
        const token = req.body?.token ?? "";
        const id = req.body?.id ?? "";
        const action = req.body?.action ?? "";
	const teacherid = req.body?.teacherid ?? "";
	if(teacherid == "")return res.status(401).send("No teacher id")
        if(role != "ADMINISTRATOR"){
                return res.status(401).send("INVALID ROLE INPUT")
        }
        if(action == "")return res.status(401).send("INVALID ACTION")
	const isAuth = await authUtils.check_token(req, res)
	if(isAuth == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/index.htm")

	const teacher = await prisma.teacher.findUnique({
		where:{
			id:teacherid
		}
	})
	if(!teacher)return res.status(401).send("No Teacher")
	switch(action){
	case "Change E-Mail":
	case "Change Name":
	case "Change Password":{
		return res.render("admin/teacher_modify", {
			token, email, id, role, action,
			teacherid, teacher, variable: action.split(" ")[1]
		})
	}
	}
}
async function getTeachers(req, res) {
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
        if(isAuth == false)return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/index.htm")
        const teacherCount = await prisma.teacher.count();
        const maxPage = Math.ceil(teacherCount/pageSize);
	console.log(maxPage);
	console.log(page);
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
	var teachers = await prisma.teacher.findMany({
                                take: 10,
				skip: 10*(page-1),
                                orderBy:{
                                        name: "desc"
                                }
                        });
                        let i = 0;
                        while(i < teachers.length){
                                teachers[i].questionBank = await prisma.question.findMany({where:{
                                        teacherId: teachers[i].id
                                }});
                                teachers[i].courses = await prisma.course.findMany({where:{
                                        teacherId: teachers[i].id
                                }});
                                let j = 0;
                                teachers[i].students = [];
                                while(j < teachers[i].courses.length){
                                        const classes = await prisma.courseClass.findMany({where:{
                                                courseId: teachers[i].courses[j].id
                                        }});
                                        const enrollments = await prisma.studentEnrollment.findMany({where:{
                                                courseClassId: classes[0].id
                                        }})
                                        let k = 0;
                                        while(k < enrollments.length){
                                                if(teachers[i].students.indexOf(enrollments[k].studentId) == -1)teachers[i].students.push(enrollments[k].studentId)
                                                k++;
                                        }
                                        j++
				}
                                i++
                        }
                        return res.render("admin/teacher_menu", {token, email, role, maxPage, teachers, id, page, pageSize, count:teacherCount})
}

module.exports = {modifyTeacher, editTeacher, getTeachers};
