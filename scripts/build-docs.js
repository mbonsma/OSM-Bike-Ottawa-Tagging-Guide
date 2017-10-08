const fs = require('fs')
const path = require('path')
const glob = require('glob')
const yaml = require('js-yaml')

// File Paths
const schemaPath = path.join(__dirname, '..', 'schema')
const readmePath = path.join(__dirname, '..', 'README.md')

// Create write stream to ./README.md
const README = fs.createWriteStream(readmePath)
README.write('# OSM Bike Ottawa Tagging Guide\n\n')

// Build Table of Contents
README.write('## Table of Contents\n\n')
README.write('<ul>\n')
glob.sync(path.join(schemaPath, '*.yml')).forEach(filepath => {
  const schema = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
  const title = schema.title || path.parse(filepath).name
  README.write(`  <li><a href='#${title}'>${title}</a></li>\n`)
})
glob.sync(path.join(schemaPath, '*.md')).forEach(filepath => {
  const title = path.parse(filepath).name
  README.write(`  <li><a href='#${title}'>${title}</a></li>\n`)
})
README.write('</ul>\n\n')

// Iterate & parse over each YAML document
glob.sync(path.join(schemaPath, '*.yml')).forEach(filepath => {
  const schema = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))

  // Markdown Attributes
  const title = schema.title || path.parse(filepath).name
  const introduction = schema.introduction
  const features = schema.features

  // Write Title
  README.write(`<h2 id="${title}">${title}</h2>\n\n`)
  if (introduction) README.write(`${introduction}\n`)

  // Write Table Header
  README.write('| Feature             | Description         | OSM Schema          | Photos              |\n')
  README.write('|---------------------|---------------------|---------------------|---------------------|\n')

  // Write Each Feature
  features.forEach(({feature, description, osm, elements, mapillary}) => {
    // Format cells
    osm = formatOSM(osm, elements)
    elements = formatElements(elements)
    description = formatDescription(description)
    mapillary = formatMapillary(mapillary)

    // Save Row
    README.write(`|**${feature}**|${description}|${elements}<br>${osm}|${mapillary}|\n`)
  })
  README.write('\n')
})

// Iterate & parse over each Markdown document
glob.sync(path.join(schemaPath, '*.md')).forEach(filepath => {
  const markdown = fs.readFileSync(filepath, 'utf8')

  // Markdown Attributes
  const title = path.parse(filepath).name

  // Write Title
  README.write(`<h2 id="${title}">${title}</h2>\n\n`)
  README.write(markdown)
  README.write('\n')
})

/**
 * Format OSM for Markdown syntax
 *
 * @param {string|string[]|null} osm OSM
 * @returns {string}
 */
function formatOSM (osm) {
  if (!osm) return ''
  if (!osm.length) return ''
  if (typeof osm === 'string') return osm.replace(/\n/g, '<br>')
  if (Array.isArray(osm)) {
    return osm.join('<br>')
  }
  throw new Error('cannot format osm')
}

/**
 * Format OSM Elements for Markdown syntax
 *
 * @param {string|string[]|null} elements Elements
 * @returns {string}
 */
function formatElements (elements) {
  if (!elements) return ''
  if (!elements.length) return ''
  if (typeof elements === 'string') return `![${elements}]`
  if (Array.isArray(elements)) {
    return elements.map(element => `![${element}]`).join(' ')
  }
  throw new Error('cannot format elements')
}

/**
 * Format Description for Markdown syntax
 *
 * @param {string|string[]|null} description Description
 * @returns {string}
 */
function formatDescription (description) {
  if (!description) return ''
  if (!description.length) return ''
  if (typeof description === 'string') return description.replace(/\n/g, '<br>')
  if (Array.isArray(description)) {
    return description.join('<br>')
  }
  throw new Error('cannot format description')
}

/**
 * Format Mapillary for Markdown syntax
 *
 * @param {string|string[]|null} osm OSM
 * @returns {string}
 */
function formatMapillary (mapillary) {
  if (!mapillary) return ''
  if (!mapillary.length) return ''
  if (typeof mapillary === 'string') return mapillaryPhoto(mapillary)
  if (Array.isArray(mapillary)) {
    return mapillary.map(imageKey => mapillaryPhoto(imageKey)).join('<br>')
  }
  throw new Error('cannot format mapillary')
}

/**
 * Converts Mapillary Image Key to Photo URL
 *
 * @param {string} mapillary Mapillary Image Key
 * @returns {string} Photo URL
 */
function mapillaryPhoto (mapillary) {
  const href = `https://www.mapillary.com/app/?focus=photo&pKey=${mapillary}`
  const src = `https://d1cuyjsrcm0gby.cloudfront.net/${mapillary}/thumb-1024.jpg`
  const style = 'min-width:300px;max-width:300px'
  return `<a href='${href}'><img style='${style}' src='${src}'></a>`
}

README.write(`
[highway_cycleway]: http://wiki.openstreetmap.org/wiki/Tag:highway=cycleway
[cycleway]: http://wiki.openstreetmap.org/wiki/Key:cycleway
[highway]: http://wiki.openstreetmap.org/wiki/Key:highway
[path]: http://wiki.openstreetmap.org/wiki/Tag:highway=path
[bicycle]: http://wiki.openstreetmap.org/wiki/Key:bicycle
[surface]: https://wiki.openstreetmap.org/wiki/Key:surface
[fine_gravel]: https://wiki.openstreetmap.org/wiki/tag:surface=fine_gravel
[asphalt]: https://wiki.openstreetmap.org/wiki/tag:surface=asphalt
[smoothness]: https://wiki.openstreetmap.org/wiki/Key:smoothness
[access:conditional]: http://wiki.openstreetmap.org/wiki/Conditional_restrictions
[flood_prone]: http://wiki.openstreetmap.org/wiki/Key:flood_prone
[width]: http://wiki.openstreetmap.org/wiki/Key:width
[desire]: http://wiki.openstreetmap.org/wiki/Tag:path=desire
[hgv]: http://wiki.openstreetmap.org/wiki/Key:hgv
[barrier]: http://wiki.openstreetmap.org/wiki/Key:barrier
[cycle_barrier]: http://wiki.openstreetmap.org/wiki/Tag:barrier=cycle_barrier
[block]: https://wiki.openstreetmap.org/wiki/Tag:barrier=block
[buffer]: http://wiki.openstreetmap.org/wiki/Proposed_features/Buffered_bike_lane
[boardwalk]:http://wiki.openstreetmap.org/wiki/Tag:bridge=boardwalk
[ramp]:http://wiki.openstreetmap.org/wiki/Key:ramp
[steps]:http://wiki.openstreetmap.org/wiki/Tag:highway=steps
[shoulder]:http://wiki.openstreetmap.org/wiki/Key:shoulder
[share_busway]:http://wiki.openstreetmap.org/wiki/Tag:cycleway=share_busway
[parking:lane]:http://wiki.openstreetmap.org/wiki/Key:parking:lane
[seasonal]:http://wiki.openstreetmap.org/wiki/Key:seasonal
[segregated]:http://wiki.openstreetmap.org/wiki/Key:segregated
[bollard]: https://wiki.openstreetmap.org/wiki/Tag:barrier=bollard
[dismount]: http://wiki.openstreetmap.org/wiki/Key:access
[asl]: http://wiki.openstreetmap.org/wiki/Tag:cycleway=asl
[foot]: https://wiki.openstreetmap.org/wiki/Key:foot
[oneway]: http://wiki.openstreetmap.org/wiki/Key:oneway
[sharrows]: http://wiki.openstreetmap.org/wiki/Proposed_features/shared_lane
[bridge]: https://wiki.openstreetmap.org/wiki/Key:bridge
[traffic_sign]: https://wiki.openstreetmap.org/wiki/Key:traffic_sign
[lanes]: https://wiki.openstreetmap.org/wiki/Key:lanes
[maxspeed]: https://wiki.openstreetmap.org/wiki/Key:maxspeed
[access]: https://wiki.openstreetmap.org/wiki/Key:access
[parking]: https://wiki.openstreetmap.org/wiki/Key:parking
[swing_gate]: https://wiki.openstreetmap.org/wiki/Tag:barrier=swing_gate
[node]: /img/node.png "Node"
[way]: /img/way.png "Way"
[area]: /img/area.png "Area"
[relation]: /img/relation.png "Relation"
`)
