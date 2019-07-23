const gulp = require('gulp'); // 自动化构建项目的工具
const fs = require('fs'); // node内置的文件系统模块
const path = require('path'); // node内置的路径拼接处理模块
const runSequence = require('run-sequence'); // 按照指定顺序执行task任务的插件
const opn = require('opn'); // 自动打开浏览器
const uglify = require('gulp-uglify'); // 压缩混淆js的gulp插件
const eslint = require('gulp-eslint'); // 使用eslint进行代码校验
const cleanCss = require('gulp-clean-css'); // 压缩css的gulp插件
const autoprefixer = require('gulp-autoprefixer'); // css样式自动添加浏览器内核前缀，如-webkit,-moz,-o
const htmlmin = require('gulp-htmlmin'); // 压缩html文件的gulp插件
const imagemin = require('gulp-imagemin'); // 压缩PNG, JPEG, GIF and SVG格式的图片的gulp插件
const babel = require('gulp-babel'); // 转义es6语法的gulp插件
const less = require('gulp-less'); // 编译less的gulp插件
const concat = require('gulp-concat'); // 合并文件的gulp插件
const gulpIf = require('gulp-if'); // 条件判断
const connect = require('gulp-connect'); // 创建web服务器的gulp插件
const rename = require('gulp-rename'); // 重命名插件
const plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins(捕获错误))
const preprocess = require('gulp-preprocess'); // 在html和JS中自定义环境变量的gulp插件

const isProd = process.env.ENV === 'prod'; // 判断当前环境是否为生产环境
// console.log('当前环境是', process.env.ENV);
const buildPath = 'src'; // 要打包的文件目录
const destPath = 'dist'; // 打包输出目录

/**
 * @param { dir：string，文件夹名称}
 * @return {dir文件夹下的文件夹名称数组}  
 */
function getFolders (dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        })
}
// console.log('getFolders', getFolders('src'));
// console.log(path.join(buildPath, 'index', 'index.html'));

// 打包js
gulp.task('minifyJs', function () {
    getFolders(buildPath).map(function (folder) {
        gulp.src(path.join(buildPath, folder, 'js/*.js'))
            .pipe(plumber())
            .pipe(babel({
                // presets: ['env']
                presets: ['es2015']
            }))
            .pipe(eslint({useEslintrc: false}))
            .pipe(eslint.failOnError())
            .pipe(gulp.dest(path.join(destPath, folder, 'js')))
            .pipe(gulpIf(isProd, concat('main.js')))
            .pipe(gulpIf(isProd, uglify()))
            .pipe(gulp.dest(path.join(destPath, folder, 'js')))
            .pipe(connect.reload());
    });
});


// 打包css
gulp.task('minifyCss', function () {
    getFolders(buildPath).map(function (folder) {
        gulp.src(path.join(buildPath, folder, 'css/*.*')) // 输出要打包的css文件
            .pipe(autoprefixer())
            .pipe(less())
            .pipe(gulp.dest(path.join(destPath, folder, 'css')))
            // .pipe(concat('main.css'))
            .pipe(gulpIf(isProd, cleanCss())) // 兼容ie9及以上
            .pipe(gulp.dest(path.join(destPath, folder, 'css'))) // 把打包压缩好的css打包到dist/index目录下的js文件夹中
            .pipe(connect.reload());
        });
});

// 压缩图片
gulp.task('minifyImgs', function () {
    getFolders(buildPath).map(function (folder) {
        gulp.src(path.join(buildPath, folder, 'imgs/*.*'))
            .pipe(gulpIf(isProd, imagemin()))
            .pipe(gulp.dest(path.join(destPath, folder, 'imgs')))
            .pipe(connect.reload());
        });
});

// 压缩html
gulp.task('minifyHtml', function () {
    getFolders(buildPath).map(function (folder) {
        gulp.src(path.join(buildPath, folder, '*.html'))
            // .pipe(plumber())
            .pipe(gulpIf(isProd, htmlmin({collapseWhitespace: true})))
            .pipe(gulp.dest(path.join(destPath, folder)))
            .pipe(connect.reload());
        });
});

// 创建本地web服务
gulp.task('devServer', function () {
    connect.server({
        name: 'Dev Server',
        host: '127.0.0.1',
        root: ['dist'],
        port: 8000,
        livereload: true
    });
});

// 监听文件修改
gulp.task('watch', function () {
    gulp.watch('src/**/js/*.js', ['minifyJs']);
    gulp.watch('src/**/css/*.css', ['minifyCss']);
    gulp.watch('src/**/imgs/*.*', ['minifyImgs']);
    gulp.watch('src/**/*.html', ['minifyHtml']);
});


// 使用gulp命令，默认执行'default'任务
gulp.task('default', ['minifyJs', 'minifyCss', 'minifyImgs', 'minifyHtml', 'devServer', 'watch'], function () {
    console.log('build successful!');
    // 在mac上设置打开的浏览器类型为chrome会报：UnhandledPromiseRejectionWarning: Error: Exited with code 1 错误
    // opn('http://127.0.0.1:8000/index', {app: 'chrome'});
    opn('http://127.0.0.1:8000/index');
});