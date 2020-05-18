const path = require('path')
const fs = require('fs')
const svgson = require('svgson')

/**
 * Convert SVG file into JS file
 * 
 * @param {string} dir - Name of directory
 * @param {string} file - Name of SVG file
 */
const svgToJs = (file) => {
  fs.mkdir(path.join(__dirname, 'maps', file.slice(0, file.length-4)), (err) => { 
    if (err) { 
        return console.error(err); 
    } 
    console.log('Directory created successfully!'); 
  }); 
  const svgFile = path.join(__dirname, 'maps', file)
  const jsFile = path.join(__dirname, 'maps', file.slice(0, file.length-4), 'mapData.js')

  if (fs.existsSync(jsFile)) {
    console.log(`File ${jsFile} already exists`)
    return
  }

  const handlePath = (element) => {
    const id = element.attributes.id;
    const obj = {
      [id]: {
        id: id,
        d: [element.attributes.d]
      }
    }
    console.log("path:", obj);
    return obj;
  }

  const handleGroup = (element) => {
    const id = element.attributes.id;
    const paths = element.children.map(e => e.attributes.d);
    const obj = {
      [id]: {
        id: id,
        d: [paths]
      }
    }
    console.log("groups:", obj);
    return obj;
  }

  fs.readFile(svgFile, 'utf8', (err, data) => {
    if (err) {
      console.error(`Unable to read file ${svgFile}`, err)
      return
    }
    console.log(`Parsing file ${svgFile}`)
    svgson.parse(data)
      .then(json => {

        const obj = {
          label: json.attributes['aria-label'],
          viewBox: json.attributes.viewBox,
          elements: json.children.map(element => element.name === "path" ? handlePath(element) : handleGroup(element))
        }


        // const obj = {
        //   label: json.attributes['aria-label'],
        //   viewBox: json.attributes.viewBox,
        //   locations: json.children
        //     .filter(child => {
        //       if (child.name !== 'path') {
        //         console.warn(`<${child.name}> tag will be ignored`)
        //         return false
        //       }

        //       return true
        //     })
        //     .map(child => ({
        //       name: child.attributes.name,
        //       id: child.attributes.id,
        //       path: child.attributes.d,
        //     }))
        // }
        const js = `export default ${JSON.stringify(obj)}`

        console.log(`Writing file ${jsFile}`)
        fs.writeFile(jsFile, js, 'utf8', err => {
          if (err) {
            console.error(`Unable to write file ${jsFile}`, err)
            return
          }
        })
      }).catch(err => {
        console.error(`Unable ton parse file ${svgFile}`, err)
      })
  })
}

// Read maps directory
fs.readdir(path.join(__dirname, 'maps'), (err, files) => {
  if (err) {
    console.log('Unable to scan maps directory', err)
    return
  }
  files.forEach(file => {
    if (path.extname(file) === '.svg') {
      svgToJs(file)
    }
  })
})





