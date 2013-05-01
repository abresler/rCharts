var editor = ace.edit("notebook");
editor.setTheme("ace/theme/solarized_light");
editor.getSession().setMode('ace/mode/r');
editor.getSession().setUseWrapMode(true);
editor.getSession().setTabSize(2);
editor.getSession().setFoldStyle('markbegin');

editor.getSession().on('change', function(e) {
  $('#nbSrc').val(editor.getValue()).change();
});
editor.getSession().selection.on('changeSelection', function(e) {
  var s = editor.session.getTextRange(editor.getSelectionRange());
  if (s == '') s = editor.getValue();
  $('#nbSrc').val(s).change();
});
editor.commands.addCommand({
  name: 'insertChunk',
  bindKey: 'Ctrl-Alt-I',
  exec: function(editor) {
    editor.insert('```{r}\n\n```\n');
    editor.navigateUp(2);
  }
});
editor.commands.addCommand({
  name: 'compileNotebook',
  bindKey: 'F4|Ctrl-Shift-H',
  exec: function(editor) {
    $('#proxy button').trigger('click');
  }
});

$(document).ready(function() {
  var h = window.location.search;
  function setSrc(msg) {
    if (msg) {
      alert('unable to read URL ' + h + '\n\nusing default R Markdown example');
    }
    $('#nbSrc').val(editor.getValue());
    $('#proxy button').trigger('click');
  }
  var w = Math.max($(window).width()/2, 300);
  $('#notebook').width(w - 10);
  $('#nbOut').css('left', w + 10 + 'px');
  if (h) {
    // pass a url as a query string after ? in the url
    h = h.replace('?', '');
    $.get(h, {}, function(res) {
      var data = res.data, str = data.content;
      if (typeof(str) != 'string') return(setSrc(true));
      if (data.encoding == 'base64') {
        str = str.replace(/\n/g, '');
        str = decodeURIComponent(escape(window.atob( str )));
      }
      if (str) {
        editor.setValue(str);
        editor.gotoLine(1);
        setSrc(false);
      } else setSrc(true);
    }, 'jsonp')
    .error(function() {
      setSrc(true);
    });
  } else setSrc(false);
})
