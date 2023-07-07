fs = require('fs')
const { minify } = require("terser")

let source = fs.readFileSync('./script.js').toString()


;(async function(){


//let name = [0,0,0,0]
let start = 97//'A'.charCodeAt(0)
let end = 122//'z'.charCodeAt(0)
let name = [0,0,0,0,0,0,0,0,start-1]
function set(index,val){
    if(name[(name.length-1)-index]==0){
        name[(name.length-1)-index]=start
    }
    if(name[(name.length-1)-index]>=end){
        set(index+1,1)
        name[(name.length-1)-index] = start
    }else{
        name[(name.length-1)-index] += val
    }
}
function getName(val){
    return val.map(v=>{
        if(v==0){
            return ''
        }
        return String.fromCharCode(v)
    }).join('')
}
/*let index=0
while(true){
    index++
    set(0,1)
    console.log(getName(name))
    if(index>128){
        break
    }
}

console.log(getName(name))*/
function getShortName(){
    //const res = getName(name)
    set(0,1)
    return '_'+getName(name)
}






let params = []

source.replace(/(var|let|const)[\ ]{1,}([\w]+)/gm,match=>{
    //console.log(match.split(' ')[1])
    const name = match.split(' ')[1]
    if(!params.includes(name)){
        params.push(name)
    }
    return match
})
source.replace(/function[\ ]+([\w]+)\(([\w\,\ ]+)\)/gm,match=>{
    //console.log(match.split(' ')[1])
    const name = match.split('(')[1].replace(')','')
    name.split(',').map(n=>{
        //console.log(n)
        if(!params.includes(n.trim())){
            params.push(n.trim())
        }
    })
    return match
})
source.replace(/function[\ ]+([\w]+)\(/gm,match=>{
    const name = match.split(' ')[1].replace('(','')
    if(!params.includes(name.trim())){
        params.push(name.trim())
    }
    return match
})
//console.log(params)


params=params.filter(p=>p.length>1)
params=params.sort((a,b)=> (a.length>b.length)*2-1)

const map = {}
params.map(p=>{
    map[p] = getShortName()
})

//\b(mo_matrix)\b

Object.keys(map).map(k=>{
    source = source.replace(new RegExp('\\b('+k+')\\b','gm'),map[k])
})


//console.log(map)



source = source.replace(/\/\/(.*)/gm,'')
source = source.replace(/\/\*[\s\S]+?\*\//gm,'')


fs.writeFileSync('./script.min.js',source)


source = source.replace(/([\)\;\}]+)\n/gm,'$1;\n')
source = source.replace(/[\;]+/gm,';')

source = source.replace(/[\n]+/gm,'')

source = source.replace(/[\ ]+?(\=|\|)[\ ]+?/gm,'$1')
source = source.replace(/(\,|\[|\+|\-|\{|\;)[\ ]+/gm,'$1')
source = source.replace(/[\ ]+(\(|\)|\]|\{)/gm,'$1')


fs.writeFileSync('./script2.min.js',source)


const names = []
source.replace(/(\.[a-zA-Z]{1}[a-zA-Z0-9\_]+)/gm,match=>{
    const name=match.substring(1)
    if(!names.includes(name)){
        names.push(name)
    }
    return match
})

names.map((name,index)=>{
    source = source.replace(new RegExp('\\.'+name,'gm'),'[_('+index+')]')
})
//console.log(names)
source = `const _d=['${names.join('\',\'')}'];
function _(idx){
    return _d[idx];
};
`+source

fs.writeFileSync('./script3.min.js',source)



var result = await minify(source, { sourceMap: true })

fs.writeFileSync('./script4.min.js',result.code)



})();