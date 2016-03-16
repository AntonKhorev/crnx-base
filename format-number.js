'use strict'

const formatNumbers=require('./format-numbers')

const formatNumber=(number,precision)=>formatNumbers     ([number],precision)[0]
formatNumber.html =(number,precision)=>formatNumbers.html([number],precision)[0]
formatNumber.js   =(number,precision)=>formatNumbers.js  ([number],precision)[0]
formatNumber.glsl =(number,precision)=>formatNumbers.glsl([number],precision)[0]

module.exports=formatNumber
