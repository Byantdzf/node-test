'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");

moment.locale('zh-cn');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Photo.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: '用户ID必须填写。' },
        notEmpty: { msg: '用户ID不能为空。' },
        async isPresent(value) {
          const user = await sequelize.models.User.findByPk(value)
          if (!user) {
            throw new Error(`ID为：${value} 的用户不存在。`);
          }
        }
      }
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'path必须填写。' },
        notEmpty: { msg: 'path不能为空。' }
      }
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue("createdAt")).format("LL");
      }
    },
    updatedAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue("updatedAt")).format("LL");
      }
    },
  }, {
    sequelize,
    modelName: 'Photo',
  });
  return Photo;
};
