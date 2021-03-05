'use strict';

const mammoth = require('../mammoth.js');
const fs = require('fs');
const settings = require('ep_etherpad-lite/node/utils/Settings');

exports.import = (hookName, args, callback) => {
  const srcFile = args.srcFile;
  const destFile = args.destFile;

  if (!settings.ep_docx) {
    settings.ep_docx = {};
  }
  if (settings.ep_docx.ignoreEmptyParagraphs !== false) {
    settings.ep_docx.ignoreEmptyParagraphs = true;
  }

  const options = {
    styleMap: [
      // "p[style-name='center'] => p:fresh > center",
      // "p[style-name='right'] => p:fresh > right",
      // "p[style-name='left'] => p:fresh > left",
      // "p[style-name='justify'] => p:fresh > justify",

      "p[style-name='Heading 1'] => p:fresh > h1.test2:fresh",
      "p[style-name='Heading 2'] => p:fresh > h2:fresh",
      "p[style-name='Heading 3'] => p:fresh > h3:fresh",
      "p[style-name='Heading 4'] => p:fresh > h4:fresh",
      "p[style-name='Heading 5'] => p:fresh > h5:fresh",
      "p[style-name='Heading 6'] => p:fresh > h6:fresh",
      
      // CUSTOM ERWAN GOOGLE DOCS
      "p[style-name='Title'] => p:fresh > h1.title:fresh",
      "p[style-name='Subtitle'] => p:fresh > h2.subtitle:fresh",
    ],
    // transformDocument: transformElement,
    // transformDocument: mammoth.transforms.paragraph(transformParagraph),
    ignoreEmptyParagraphs: false,
    includeEmbeddedStyleMap: true,
    includeDefaultStyleMap: true,
  };

  // First things first do we handle this doc type?
  const docType = srcFile.split('.').pop();

  if (docType !== 'docx') return callback(); // we don't support this doctype in this plugin
  console.log('Using mammoth[ep_docx] to convert DocX file');

  mammoth.convertToHtml(
    {
      path: srcFile,
    }, options).then(
      (result) => {
        console.log("RESULT : ", result);
        fs.writeFile(destFile, `<!doctype html>\n<html lang='en'>
            <body>
            ${result.value}
            </body>
            </html>
          `, 'utf8', (err, b) => {
          if (err) callback(err, null);
          callback(destFile);
        });
      })
    .fail((e) => {
      console.warn('Mammoth failed to import this file', e, Object.keys(e), typeof e);
      return callback();
    })
    .done(() => {

    });
};


function transformParagraph(paragraph) {
  var runs = mammoth.transforms.getDescendantsOfType(paragraph, "run");
  console.log("PARAGRAPH ", JSON.stringify(runs))
  const {color, highlight, fontSize} = run;
  return {
    ...paragraph,
    color,
    highlight,
    fontSize
  };
}


// function transformElement(element) {
//   // console.log("ELEMENT : ", element);
//   if (element.children) {
//     var children = element.children.map(el => { return transformElement(el)});
//     element = { ...element, children: children };
//   }

//   if (element.type === "paragraph") {
//     element = transformParagraph(element);
//   }

//   return element;
// }

// function transformParagraph(element) {
//   console.log("PARAGRAPH : ", element);
//   if (element.alignment === "center" && !element.styleId) {
//       return {...element, styleId: "Heading2"};
//   }
//   return element;
// }

