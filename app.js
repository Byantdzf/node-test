const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')


require('dotenv').config();

const adminAuth = require('./middlewares/admin-auth');
const userAuth = require('./middlewares/user-auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const categoriesRouter  = require('./routes/categories');
const chaptersRouter  = require('./routes/chapters');
const articlesRouter = require('./routes/articles');
const coursesRouter = require('./routes/courses');
const settingsRouter = require('./routes/settings');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');
const photosRouter = require('./routes/photos');
const uploadsRouter = require('./routes/uploads');
// 后台路由文件
const adminArticlesRouter = require('./routes/admin/articles');
const adminCategoriesRouter = require('./routes/admin/categories');
const adminSettingsRouter = require('./routes/admin/settings');
const adminUsersRouter = require('./routes/admin/users');
const adminCoursesRouter = require('./routes/admin/courses');
const adminChaptersRouter = require('./routes/admin/chapters');
const adminChartsRouter = require('./routes/admin/charts');
const adminAuthRouter = require('./routes/admin/auth');
const adminAttachmentsRouter = require('./routes/admin/attachments');


const app = express();
/**
 * cors跨域
 */
// CORS 跨域配置
// const corsOptions = {
//     origin: [
//         'https://clwy.cn',
//         'http://localhost:63342'
//     ],
// }
// app.use(cors(corsOptions));


app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', userAuth,usersRouter);
app.use('/categories', categoriesRouter );
app.use('/courses', coursesRouter);
app.use('/chapters', chaptersRouter);
app.use('/articles', articlesRouter);
app.use('/settings', settingsRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);
app.use('/photos', userAuth,photosRouter);
app.use('/uploads', userAuth, uploadsRouter);
// 后台路由配置
app.use('/admin/articles', adminAuth, adminArticlesRouter);
app.use('/admin/categories', adminAuth, adminCategoriesRouter);
app.use('/admin/settings', adminAuth, adminSettingsRouter);
app.use('/admin/users', adminAuth, adminUsersRouter);
app.use('/admin/courses', adminAuth, adminCoursesRouter);
app.use('/admin/chapters', adminAuth, adminChaptersRouter);
app.use('/admin/charts', adminAuth, adminChartsRouter);
app.use('/admin/auth', adminAuthRouter);
app.use('/admin/attachments', adminAuth, adminAttachmentsRouter);

module.exports = app;
