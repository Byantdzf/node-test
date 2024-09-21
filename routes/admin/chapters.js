const express = require('express');
const router = express.Router();
const {Chapter, Course} = require('../../models')
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

const {Op} = require('sequelize')

/* GET home page. 获取章节列表 */
// router.get('/', async function(req, res, next) {
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){ // 查询章节title
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     if (query.content){ // 查询章节content
//       condition.where = {
//         content:{
//           [Op.like]: `%${query.content}%`
//         }
//       }
//     }
//     const  chapters = await Chapter.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         chapters
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

/* GET home page. 获取章节列表 */
router.get('/', async function (req, res, next) {
    try {
        const query = req.query
        const currentPage = Math.abs(Number(query.currentPage)) || 1
        const pageSize = Math.abs(Number(query.pageSize)) || 10
        const offset = (currentPage - 1) * pageSize

        if (!query.courseId) {
            throw new Error('获取章节列表失败，课程ID不能为空。');
        }

        const condition = {
            ...getCondition(),
            order: [['rank', 'ASC'], ['id', 'ASC']],
            limit: pageSize,
            offset: offset
        };

        condition.where = {
            courseId: {
                [Op.eq]: query.courseId
            }
        };

        if (query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`
                }
            };
        }

        const {count, rows} = await Chapter.findAndCountAll(condition)
        success(res, "查询章节列表成功", {
            chapters: rows, pagination: {
                total: count, currentPage, pageSize
            }
        })
    } catch (error) {
        failure(res, error)
    }
});

// 查询章节详情
// get /admin/chapters/:id
router.get('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  chapter = await Chapter.findByPk(id)
        const chapter = await getChapter(req)
        success(res, "查询章节成功", {chapter})
        // res.json({
        //     status: true, message: 'success', data: chapter
        // })
    } catch (error) {
        failure(res, error)
    }
})
// 创建章节
// get /admin/chapters/:id
router.post('/', async function (req, res, next) {
    try {
        const body = filterBody(req)

        const chapter = await Chapter.create(body)
        // 201 代表添加了新的资源
        success(res, "创建章节成功", {chapter}, 201)

        // res.status(201).json({
        //     status: true,
        //     message: 'success',
        //     data: chapter
        // })
    } catch (error) {
        failure(res, error)
    }
})

// 删除章节
// get /admin/chapters/:id
router.delete('/:id', async function (req, res, next) {
    try {
        const chapter = await getChapter(req)
        await chapter.destroy()
        success(res, "删除章节成功")
        // res.json({
        //     status: true, message: 'success'
        // })

    } catch (error) {
        failure(res, error)
    }
})

// 更新章节
// get /admin/chapters/:id
router.put('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  chapter = await Chapter.findByPk(id)
        const chapter = await getChapter(req)
        const body = filterBody(req)
        await chapter.update(body)
        success(res, "更新章节成功", {chapter})
    } catch (error) {
        failure(res, error)
    }
})
// 搜索章节
// get /admin/chapters/:id
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
//     const  chapters = await Chapter.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         chapters
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
// 公共方法：查询当前章节
async function getChapter(req) {
    const {id} = req.params // 获取章节id
    const condition = getCondition()
    const chapter = await Chapter.findByPk(id, condition)
    if (!chapter) {
        throw new NotFoundError(`ID：${id}的章节未找到`)
    }
    return chapter
}

/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        attributes: {exclude: ['CourseId']},
        include: [
            {
                model: Course,
                as: 'course',
                attributes: ['id', 'name']
            }
        ]
    }
}


/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{rank: (number|*), video: (string|boolean|MediaTrackConstraints|VideoConfiguration|*), title, courseId: (number|*), content}}
 */
function filterBody(req) {
    return {
        courseId: req.body.courseId,
        title: req.body.title,
        content: req.body.content,
        video: req.body.video,
        rank: req.body.rank
    };
}


module.exports = router;
