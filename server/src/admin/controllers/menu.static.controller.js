const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authSessionService = require('../services/authSession.service');
const page_utils = require('../../utils/page.utils');

function signToken(id) {
  return jwt.sign({ sub: id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

async function base(req, res){
	console.log(req.body);
	const email = req.body?.email ?? "";
	const role = req.body?.role ?? "";
	const token = req.body?.token ?? "";
	const id = req.body?.id ?? "";
	const action = req.body?.action ?? "";
	if(email.trim() == ""){
		return res.status(401).send("INVALID EMAIL INPUT")
	}
	if(role != "TEACHER" && role != "ADMINISTRATOR"){
		return res.status(401).send("INVALID ROLE INPUT")
	}
	if(token == "") return res.status(401).send("INVALID TOKEN")
	if(id == "") return res.status(401).send("INVALID ID")
	if(action == "")return res.status(401).send("INVALID ACTION")
	
	try{
		jwt.verify(token, process.env.JWT_SECRET);
	}catch{
		console.error("BAD TOKEN")
		return page_utils.page_redirect(res, "https://chemu-app.github.io/chemu-admin/src/www/index.htm")
	}
	if(role == "ADMINISTRATOR"){
                const user = await prisma.administrator.findUnique({ where: { email, id } });
                if (!user) return res.status(401).send('Invalid credentials');
		switch(action){
		case "TEACHERS":{
			const teacherCount = await prisma.teacher.count();
			const maxPage = Math.ceil(teacherCount/10);
			var teachers = await prisma.teacher.findMany({
				take: 10,
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
				console.log(teachers[i].courses);
				let j = 0;
				teachers[i].students = [];
				while(j < teachers[i].courses.length){
					console.log("check")
					const classes = await prisma.courseClass.findMany({where:{
						courseId: teachers[i].courses[j].id
					}});
					console.log(classes);
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
			return res.render("admin/teacher_menu", {token, email, role, maxPage, teachers, id: user.id, page: 1, pageSize: 10, count:teacherCount})
		}
		case "STUDENTS":{
			const studentCount = await prisma.student.count();
                        const maxPage = Math.ceil(studentCount/10);
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
			console.log(students)
                        return res.render("admin/student_menu", {token, email, role, maxPage, students, id: user.id, page: 1, pageSize: 10, count:studentCount})

		}
		case "COURSES":{
			const courseCount = await prisma.course.count();
			const maxPage = Math.ceil(courseCount/10)
			var courses = await prisma.course.findMany({
                                take: 10,
                                orderBy:{
                                        name: "desc"
                                }
                        });
                        let i = 0;
                        while(i < courses.length){
                                const classes = await prisma.courseClass.findMany({
                                        where:{
                                                courseId: courses[i].id
                                        }
                                })
				courses[i].cclass = classes[0];
                                courses[i].students = await prisma.studentEnrollment.findMany({
                                        where:{
                                             courseClassId: courses[i].cclass.id
                                        }
                                })
                                i++
                        }
			return res.render("admin/course_menu", {
				token, email, role, maxPage, courses, id,
				page: 1, pageSize: 10, count:courseCount
			})
		}
		case "LOG OUT":{

		}
		default:{
			return res.status(401).send('Invalid action');
		}
		}
		return res.status(401).send('Invalid action');
                console.log(user)
                //return res.render("admin/teacger", {token, email, role, id: user.id});
        } else if(role == "TEACHER"){
                const user = await prisma.teacher.findUnique({ where: { email, id } });
                if (!user) return res.status(401).send('Invalid credentials');
		switch(action){
                case "CO-TEACHERS":{

                }
                case "STUDENTS":{

                }
                case "COURSES":{

                }
                case "LOG OUT":{

                }
                default:{
                        return res.status(401).send('Invalid action');
                }
                }

                return await res.render("teacher/admin/main_menu", {token, email, role, name: user.name, id: user.id});

        } else {
                return res.status(401).send("INVALID REQUESET")
        }

}

async function login(req, res) {
	console.log(req.body);
	const email = req.body?.email ?? "";
	const password = req.body?.password ?? "";
	const role = req.body?.role ?? "";
	if(email.trim() == ""){
		return res.status(401).send("INVALID EMAIL INPUT")
	}
	if(password == ""){
		return res.status(401).send("INVALID PASSWORD INPUT")
	}
	if(role != "TEACHER" && role != "ADMINISTRATOR"){
		return res.status(401).send("INVALID ROLE INPUT")
	}

	if(role == "ADMINISTRATOR"){
		const user = await prisma.administrator.findUnique({ where: { email } });
		if (!user) return res.status(401).send('Invalid credentials');
		const valid = await bcrypt.compare(password, user.password);
  		if (!valid) return res.status(401).send('Invalid credentials' );
		const token = signToken(user.id);
		console.log(user)
		return res.render("admin/main_menu", {token, email, role, id: user.id});
	} else if(role == "TEACHER"){
		const user = await prisma.teacher.findUnique({ where: { email } });
		if (!user) return res.status(401).send('Invalid credentials');
		const valid = await bcrypt.compare(password, user.password);
  		if (!valid) return res.status(401).send('Invalid credentials' );
		const token = signToken(user.id);
		console.log(user)
		return await res.render("teacher/admin/main_menu", {token, email, role, name: user.name, id: user.id});
		
	} else {
		return res.status(401).send("INVALID REQUESET")
	}
}

async function refresh(req, res) {
  const { sessionToken } = req.body;
  if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

  const session = await authSessionService.validateAuthSession(sessionToken);
  if (!session) return res.status(401).json({ error: 'SESSION_EXPIRED' });

  const user = await model.findUnique({
    where: { id: session.userId },
    omit: { password: true },
  });
  if (!user) return res.status(401).json({ error: 'SESSION_EXPIRED' });

  const token = signToken(user.id, session.userRole);
  res.json({ token, user: { ...user } });
}

async function logout(req, res) {
  const sessionToken = req.body?.token;
  if (sessionToken) {
    await authSessionService.deleteAuthSession(sessionToken);
  }
  res.send('Logged out successfully');
}

module.exports = {login, refresh, logout, base};
