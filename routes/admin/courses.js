const express = require('express');
const router = express.Router();
// const {Course,Category,User} = require('../../models')
const {Course, Category, User, Chapter} = require('../../models');

const { NotFound,Conflict } = require('http-errors');
const { success, failure } = require('../../utils/responses');

const {Op} = require('sequelize')

/* GET home page. 获取课程列表 */
// router.get('/', async function(req, res, next) {
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){ // 查询课程title
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     if (query.content){ // 查询u课程content
//       condition.where = {
//         content:{
//           [Op.like]: `%${query.content}%`
//         }
//       }
//     }
//     const  courses = await Course.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         courses
//       }
//     })
//   }catch (error) {
//     res.status(500).json({
//       status: false,
//       message: 'error',
//       errors: [error.message]
//     })
//   }
// });

/* GET home page. 获取课程列表 */
router.get('/', async function (req, res, next) {
    try {
        const query = req.query
        const currentPage = Math.abs(Number(query.currentPage)) || 1
        const pageSize = Math.abs(Number(query.pageSize)) || 10
        const offset = (currentPage - 1) * pageSize

        const condition = {
            ...getCondition(),
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        };
        if (query.categoryId) { // 查询课程 categoryId
            condition.where = {
                categoryId: {
                    [Op.eq]: query.categoryId
                }
            }
        }
        if (query.userId) { // 查询课程 userId
            condition.where = {
                userId: {
                    [Op.eq]: query.userId
                }
            }
        }
        if (query.name) { // 查询课程 name
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`
                }
            }
        }
        if (query.recommended) { // 查询课程 recommended
            condition.where = {
                recommended: {
                    [Op.eq]: query.recommended === 'true'
                }
            }
        }
        if (query.introductory) { // 查询课程 introductory
            condition.where = {
                introductory: {
                    [Op.eq]: query.introductory === 'true'
                }
            }
        }
        const {count, rows} = await Course.findAndCountAll(condition)
        success(res, "查询课程列表成功", {
            courses: rows, pagination: {
                total: count, currentPage, pageSize
            }
        })
    } catch (error) {
        failure(res, error)
    }
});

// 查询课程详情
// get /admin/courses/:id
router.get('/:id', async function (req, res, next) {
    try {
        const course = await getCourse(req)
        success(res, "查询课程成功", {course})
    } catch (error) {
        failure(res, error)
    }
})
// 创建课程
// get /admin/courses/:id
router.post('/', async function (req, res, next) {
    try {
        const body = filterBody(req)
        body.userId = req.user.id
        const course = await Course.create(body)
        // 201 代表添加了新的资源
        success(res, "创建课程成功", {course}, 201)
    } catch (error) {
        failure(res, error)
    }
})

// 删除课程
// get /admin/courses/:id
router.delete('/:id', async function (req, res, next) {
    try {
        const course = await getCourse(req)
        const count = await Chapter.count({where: {courseId: req.params.id}})
        if (count > 0) {
            throw new Conflict('当前课程有章节,无法删除')
        }
        await course.destroy()
        success(res, "删除课程成功")

    } catch (error) {
        failure(res, error)
    }
})

// 更新课程
// get /admin/courses/:id
router.put('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  course = await Course.findByPk(id)
        const course = await getCourse(req)
        const body = filterBody(req)
        await course.update(body)
        success(res, "更新课程成功", {course})
    } catch (error) {
        failure(res, error)
    }
})
// 搜索课程
// get /admin/courses/:id
// router.get('/',async function (req, res, next){
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     const  courses = await Course.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         courses
//       }
//     })
//   }catch (error) {
//     res.status(500).json({
//       status: false,
//       message: 'error',
//       errors: [error.message]
//     })
//   }
// })
// 公共方法：查询当前课程
async function getCourse(req) {
    const {id} = req.params // 获取课程id
    const condition = getCondition()
    const course = await Course.findByPk(id, condition)
    if (!course) {
        throw new NotFound(`ID：${id}的课程未找到`)
    }
    return course
}

// 公共方法： 关联分类、用户数据

function getCondition() {
    return {
        attributes: {exclude: ['CategoryId', 'UserId']},
        include: [
            {model: Category, as: 'category', attributes: ['id', 'name']},
            {model: User, as: 'user', attributes: ['id', 'username', 'avatar']}
        ]
    }
}

/**
 *
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
    return {
        categoryId: req.body.categoryId,
        name: req.body.name,
        image: req.body.image,
        recommended: req.body.recommended,
        introductory: req.body.introductory,
        content: req.body.content
    };
}


module.exports = router;
