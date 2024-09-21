const express = require('express');
const router = express.Router();
const {Article} = require('../../models')
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

const {Op} = require('sequelize')

/* GET home page. 获取文章列表 */
// router.get('/', async function(req, res, next) {
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){ // 查询文章title
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     if (query.content){ // 查询文章content
//       condition.where = {
//         content:{
//           [Op.like]: `%${query.content}%`
//         }
//       }
//     }
//     const  articles = await Article.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         articles
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

/* GET home page. 获取文章列表 */
router.get('/', async function (req, res, next) {
    try {
        // return res.json({ currentUser: req.user })

        const query = req.query
        const currentPage = Math.abs(Number(query.currentPage)) || 1
        const pageSize = Math.abs(Number(query.pageSize)) || 10
        const offset = (currentPage - 1) * pageSize

        const condition = {
            order: [['id', 'DESC']], limit: pageSize, offset: offset
        }
        if (query.title) { // 查询文章title
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`
                }
            }
        }
        if (query.content) { // 查询文章content
            condition.where = {
                content: {
                    [Op.like]: `%${query.content}%`
                }
            }
        }
        const {count, rows} = await Article.findAndCountAll(condition)
        success(res, "查询文章列表成功", {
            articles: rows, pagination: {
                total: count, currentPage, pageSize
            }
        })
        // res.json({
        //     status: true,
        //     message: 'success',
        //     data: {
        //         articles: rows,
        //         pagination: {
        //             total: count,
        //             currentPage,
        //             pageSize
        //         }
        //     }
        // })
    } catch (error) {
        failure(res, error)
        // res.status(500).json({
        //     status: false,
        //     message: 'error',
        //     errors: [error.message]
        // })
    }
});

// 查询文章详情
// get /admin/articles/:id
router.get('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  article = await Article.findByPk(id)
        const article = await getArticle(req)
        success(res, "查询文章成功", {article})
        // res.json({
        //     status: true, message: 'success', data: article
        // })
    } catch (error) {
        failure(res, error)
    }
})
// 创建文章
// get /admin/articles/:id
router.post('/', async function (req, res, next) {
    try {
        const body = filterBody(req)

        const article = await Article.create(body)
        // 201 代表添加了新的资源
        success(res, "创建文章成功", {article}, 201)

        // res.status(201).json({
        //     status: true,
        //     message: 'success',
        //     data: article
        // })
    } catch (error) {
        failure(res, error)
    }
})

// 删除文章
// get /admin/articles/:id
router.delete('/:id', async function (req, res, next) {
    try {
        const article = await getArticle(req)
        await article.destroy()
        success(res, "删除文章成功")
        // res.json({
        //     status: true, message: 'success'
        // })

    } catch (error) {
        failure(res, error)
    }
})

// 更新文章
// get /admin/articles/:id
router.put('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  article = await Article.findByPk(id)
        const article = await getArticle(req)
        const body = filterBody(req)
        await article.update(body)
        success(res, "更新文章成功", {article})
    } catch (error) {
        failure(res, error)
    }
})
// 搜索文章
// get /admin/articles/:id
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
//     const  articles = await Article.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         articles
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
// 公共方法：查询当前文章
async function getArticle(req) {
    const {id} = req.params // 获取文章id
    const article = await Article.findByPk(id)
    if (!article) {
        throw new NotFoundError(`ID：${id}的文章未找到`)
    }
    return article
}

// 公共方法
function filterBody(req) {
    return {
        title: req.body.title, content: req.body.content
    }
}

module.exports = router;
