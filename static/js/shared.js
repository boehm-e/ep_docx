'use strict';

// const tags = ['h1', 'h2', 'h3', 'h4', 'code'];
const tags = ['h1', 'h2', 'h3', 'h4', 'code', 'font', 'u31title', 'subtitle', 'span'];

exports.collectContentPre = (hookName, context, cb) => {
  console.log("$ collectContentPre", context);
  const tname = context.tname;
  const state = context.state;
  const lineAttributes = state.lineAttributes;
  const tagIndex = tags.indexOf(tname);

  const cls = context.cls;
  if (cls) {
    lineAttributes.cls = cls;
  }

  const style = context.styl;
  if (style) {
    lineAttributes.style = style;
    context.style = style;
  }

  if (tname) {
    lineAttributes.tname = tname;
    context.tname = tname;
  }

  // if (tname === 'div' || tname === 'p') {
  //   delete lineAttributes.heading;
  // }
  // if (tagIndex >= 0) {
  //   lineAttributes.heading = tags[tagIndex];
  // }

  console.log('lines ', context.cc.getLines())
  return cb();
};

// I don't even know when this is run..
exports.collectContentPost = (hookName, context, cb) => {
  console.log("$ collectContentPost", context);
  const tname = context.tname;
  const state = context.state;
  const lineAttributes = state.lineAttributes;
  const tagIndex = tags.indexOf(tname);

  const cls = context.cls;
  if (cls) {
    lineAttributes.cls = cls;
  }
  const style = context.styl;
  if (style) {
    lineAttributes.style = style;
    context.style = style;
  }

  // if (tagIndex >= 0) {
  //   delete lineAttributes.heading;
  // }
  return cb();
};