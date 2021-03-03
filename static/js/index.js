'use strict';

const cssFiles = ['ep_docx/static/css/editor.css'];

// All our tags are block elements, so we just return them.
const tags = ['h1', 'h2', 'h3', 'h4', 'code', 'font', 'u31title', 'subtitle', 'span'];
// const tags = ['title', 'subtitle'];
// const tags = ['x-whatever'];
exports.aceRegisterBlockElements = () => tags;

// Bind the event handler to the toolbar buttons
exports.postAceInit = (hookName, context) => {
  console.log('$ postAceInit');
  const hs = $('#heading-selection');
  hs.on('change', function () {
    const value = $(this).val();
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue)) {
      context.ace.callWithAce((ace) => {
        ace.ace_doInsertHeading(intValue);
      }, 'insertheading', true);
      hs.val('dummy');
    }
  });
};

const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1),
  (_, i) => start + i
);

// On caret position change show the current heading
exports.aceEditEvent = (hookName, call) => {

  // If it's not a click or a key event and the text hasn't changed then do nothing
  const cs = call.callstack;
  if (!(cs.type === 'handleClick') && !(cs.type === 'handleKeyEvent') && !(cs.docTextChanged)) {
    return false;
  }
  // If it's an initial setup event then do nothing..
  if (cs.type === 'setBaseText' || cs.type === 'setup') return false;
  console.log('$ aceEditEvent', call.documentAttributeManager);

  // It looks like we should check to see if this section has this attribute
  setTimeout(() => { // avoid race condition..
    const attributeManager = call.documentAttributeManager;
    const rep = call.rep;
    const activeAttributes = {};
    $('#heading-selection').val('dummy').niceSelect('update');

    const firstLine = rep.selStart[0];
    const lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));
    let totalNumberOfLines = 0;

    range(firstLine, lastLine).forEach((line) => {
      totalNumberOfLines++;
      const attr = attributeManager.getAttributeOnLine(line, 'heading');
      if (!activeAttributes[attr]) {
        activeAttributes[attr] = {};
        activeAttributes[attr].count = 1;
      } else {
        activeAttributes[attr].count++;
      }
    });

    $.each(activeAttributes, (k, attr) => {
      if (attr.count === totalNumberOfLines) {
        // show as active class
        const ind = tags.indexOf(k);
        $('#heading-selection').val(ind).niceSelect('update');
      }
    });
  }, 250);
};

// Our heading attribute will result in a heaading:h1... :h6 class
exports.aceAttribsToClasses = (hookName, context) => {
  console.log("$ aceAttribsToClasses ", context)

  const classes = []
  // if (context.key == 'cls') {
  //   classes.push(`cls:${context.value}`);
  // }
  if (context.key == 'style') {
    classes.push(`style:${context.value}`);
  }
  if (context.key === 'heading') {
    classes.push(`heading:${context.value}`);
  }

  return classes;
};


const getProperties = (cls) => {
  let obj = {};
  cls.split(" ").filter(attr => attr).forEach(attr => {
    if (attr.indexOf(":") > 0) {
      let splt = attr.split(":")
      obj[splt[0]] = splt.splice(1).join(":")
    }
  })
  return obj;
}

// Here we convert the class heading:h1 into a tag
exports.aceDomLineProcessLineAttributes = (hookName, context) => {
  const cls = context.cls;
  const properties = getProperties(cls);
  console.log("$ aceDomLineProcessLineAttributes", context, properties);


  let modifiers = []
  
  if (Object.keys(properties).includes("style")) {
    console.log("FOUND STYLE");
    modifiers.push({
      preHtml: `<span style="${properties["style"]}">`,
      postHtml: `</span>`,
    });
  }

  if (Object.keys(properties).includes("heading")) {
    let heading = properties["heading"];
    console.log("FOUND HEADING ", heading);

    if (tags.indexOf(heading) >= 0) {
      modifiers.push({
        preHtml: `<${heading}>`,
        postHtml: `</${heading}>`,
        processedMarker: true,
      });
    }
  } 
  return modifiers;
};

// Once ace is initialized, we set ace_doInsertHeading and bind it to the context
exports.aceInitialized = (hookName, context) => {
  console.log("$ aceInitialized")
  const editorInfo = context.editorInfo;
  // Passing a level >= 0 will set a heading on the selected lines, level < 0 will remove it.
  editorInfo.ace_doInsertHeading = (level) => {
    const { documentAttributeManager, rep } = context;
    if (!(rep.selStart && rep.selEnd)) return;
    if (level >= 0 && tags[level] === undefined) return;
    const firstLine = rep.selStart[0];
    const lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));

    range(firstLine, lastLine).forEach((line) => {
      if (level >= 0) {
        documentAttributeManager.setAttributeOnLine(line, 'heading', tags[level]);
      } else {
        documentAttributeManager.removeAttributeOnLine(line, 'heading');
      }
    });
  };
};

exports.aceEditorCSS = () => cssFiles;