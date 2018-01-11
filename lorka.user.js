// ==UserScript==
// @name         LOR panel: karma and scores
// @namespace    http://tampermonkey.net/
// @version      3.0.3
// @license      MIT
// @author       https://github.com/unreg
// @updateURL    https://raw.githubusercontent.com/unreg/lorka-client/master/lorka.user.js
// @match        https://www.linux.org.ru/*
// @grant       none
// ==/UserScript==

(function() {

  const _project = 'lorka';

  // Initialize storage
  var _storage = {
    position: { right: 30, top: 70 },
    items: {
      karma: {
        title: 'карма',
        state: true
      },
      score: {
        title: 'скор',
        state: true
      },
      develmode: {
        title: 'devel mode',
        state: false
      },
    },
    expand: false,
    refer: ''
  };


  const _init = () => {

    /*
    // Font Awesome 5 (SVG)
    var fa = document.createElement('script');
    fa.src = 'https://use.fontawesome.com/releases/v5.0.2/js/all.js';
    document.getElementsByTagName('head')[0].appendChild(fa);
    */

    // Font Awesome 5 (CSS)
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://use.fontawesome.com/releases/v5.0.2/css/all.css';
    document.getElementsByTagName('head')[0].appendChild(fa);

    const _saved = JSON.parse(localStorage.getItem('lorkaStorage') || '{}');

    // Check for new features
    const items = Object.assign({}, _storage.items, _saved.items);
    _storage = Object.assign({}, _storage, _saved);
    _setValue({items: items});

    // Devel mode
    if (_storage.items.develmode.state) {
      const href = window.location.href.split('/');

      if ((href.length > 5) &&
          (href[5]) &&
          (['forum', 'gallery', 'news'].indexOf(href[3]) !== -1) &&
          (_storage.refer === 'tracker')) {
        _goBottomPage();
      }
      _setValue({'refer': href[3]});
    }
  };


  /* Miscellaneous function */
  const _emptyFunc = () => {};

  const _setValue = v => {
    _storage = Object.assign({}, _storage, v);
    localStorage.setItem('lorkaStorage', JSON.stringify(_storage));
  };

  const _style2cssText = (style = {}) => {
    return Object.keys(style).reduce((a, v) => a += `${v}:${style[v]};`, '');
  };

  const _appendChild = (parent, child) => {
    const prev = parent.querySelector(`#${child.id}`);
    if (prev) {
      parent.replaceChild(child, prev);
    } else {
      parent.appendChild(child);
    }
  };

  const _insertAfter = (parent, child, anchor) => {
    const prev = parent.querySelector(`#${child.id}`);
    if (prev) {
      parent.replaceChild(child, prev);
    } else {
      parent.insertBefore(child, anchor.nextSibling);
    }
  };

  const _goTopPage = () => scroll(0, 0);

  const _goBottomPage = () => scroll(0, document.body.scrollHeight);

  /* Miscellaneous --- */


  /* API function */
  const fetchScores = ids => {
    fetch(`https://lorka.sytes.net/scores/?ids=${ids.join(',')}`)
      .then(response => response.json())
      .then(injScoresForTopics)
      .catch(error => console.log(error));
  };

  const fetchKarmas = users => {
    fetch(`https://lorka.sytes.net/karmas/?names=${users.join(',')}`)
      .then(response => response.json())
      .then(injKarmaForUser)
      .catch(error => console.log(error));
  };

  const voteTopic = (topic_id, vote) => {
    fetch(`https://lorka.sytes.net/vote/${topic_id}/${vote}`)
      .then(response => response.json())
      .then(json => {
        const data = {};
        data[topic_id] = json;
        injScoresForTopics(data);
      })
      .catch(error => console.log(error));
  };

  const voteKarma = (user, vote = '') => {
    fetch(`https://lorka.sytes.net/karma/${user}/${vote}`)
      .then(response => response.json())
      .then(json => {
        const data = {};
        data[user] = json;
        injKarmaForUser(data);
      })
      .catch(error => console.log(error));
  };
  /* API --- */


  /* Handlers function */

  /* onClick */
  function _checkboxClick(e) {
    const item = this.id.split('-')[2];
    const icon = this.querySelector('i');

    if (icon.classList.contains('fa-check-square')) {
      icon.classList.remove('fa-check-square');
      icon.classList.add('fa-square');
      _storage.items[item].state = false;
    } else {
      icon.classList.remove('fa-square');
      icon.classList.add('fa-check-square');
      _storage.items[item].state = true;
    }
    _setValue({
      items: _storage.items
    });
  }

  function _expandClick(e) {
    const icon = this.querySelector('i');

    if (icon.classList.contains('fa-angle-left')) {
      icon.classList.remove('fa-angle-left');
      icon.classList.add('fa-angle-right');
      _storage.expand = true;
      _setValue({ expand: true });
      document.getElementById(`${_project}-panel-body`).style.display = '';
    } else {
      icon.classList.remove('fa-angle-right');
      icon.classList.add('fa-angle-left');
      _storage.expand = false;
      _setValue({ expand: false });
      document.getElementById(`${_project}-panel-body`).style.display = 'none';
      location.reload();
    }
  }
  /* onClick --- */


  /* onOver --- */
  function _scoreOnMouseEnter(e) {
    const item = this.id.split('-')[2];
    this.querySelector(`#${_project}-score-${item}-up`).style.display = '';
    this.querySelector(`#${_project}-score-${item}-down`).style.display = '';
    this.querySelector(`#${_project}-score-${item}-divider`).style.display = '';
    this.querySelector(`#${_project}-score-${item}-cons`).style.display = 'none';
  }

  function _scoreOnMouseLeave(e) {
    const item = this.id.split('-')[2];
    this.querySelector(`#${_project}-score-${item}-up`).style.display = 'none';
    this.querySelector(`#${_project}-score-${item}-down`).style.display = 'none';
    this.querySelector(`#${_project}-score-${item}-divider`).style.display = 'none';
    this.querySelector(`#${_project}-score-${item}-cons`).style.display = '';
  }

  function _karmaOnMouseEnter(e) {
    const item = this.id.split('-')[2];
    this.querySelector(`#${_project}-karma-${item}-up`).style.display = 'inline';
    this.querySelector(`#${_project}-karma-${item}-down`).style.display = 'inline';
    this.querySelector(`#${_project}-karma-${item}-divider`).style.display = 'inline';
    this.querySelector(`#${_project}-karma-${item}-cons`).style.display = 'none';
  }

  function _karmaOnMouseLeave(e) {
    const item = this.id.split('-')[2];
    this.querySelector(`#${_project}-karma-${item}-up`).style.display = 'none';
    this.querySelector(`#${_project}-karma-${item}-down`).style.display = 'none';
    this.querySelector(`#${_project}-karma-${item}-divider`).style.display = 'none';
    this.querySelector(`#${_project}-karma-${item}-cons`).style.display = 'inline';
  }
  /* onOver --- */

  /* Drag'n'drop panel */
  function _dragStart(e) {
    const panel = document.getElementById(`${_project}-main-panel`);
    const { top, left, width } = panel.getBoundingClientRect();
    const { clientX, clientY } = e;

    _storage.dY = top - clientY;
    _storage.dX = (left + width) - clientX;

    window.addEventListener('mousemove', _dragOver, true);
  }

  function _dragOver(e) {
    const { clientX, clientY } = e;
    const {clientWidth} = document.documentElement;
    const panel = document.getElementById(`${_project}-main-panel`);

    const top = clientY + _storage.dY;
    const right = (clientWidth - clientX) - _storage.dX;

    panel.style.top = top + 'px';
    panel.style.right = right + 'px';

    _setValue({
      position: {
        top: top,
        right: right
      }
    });
  }

  function _dragEnd(e) {
    window.removeEventListener('mousemove', _dragOver, true);
    _storage.dY = 0;
    _storage.dX = 0;
  }
  /* Drag'n'drop --- */

  /* Handlers --- */


  /* Components */
  const cIcon = (id, style = {}, ext = {}) => {
    const { type='far', size='1x', icon='', onclick=_emptyFunc } = ext;

    const component = document.createElement('i');
    component.id = id;
    component.style.cssText = _style2cssText(style);
    component.classList.add(type, `fa-${size}`, `fa-${icon}`);
    component.addEventListener('click', onclick);

    return component;
  };

  const cText = (id, style = {}, ext = {}) => {
    const { text } = ext;
    const component = document.createElement('span');
    component.id = id;
    component.style.cssText = _style2cssText(style);
    component.innerHTML = '&nbsp;&nbsp;' + text;

    return component;
  };

  const cCheckBox = (id, style = {}, ext = {}) => {
    const { name, title, checked } = ext;

    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIcon(
      `${_project}-checkbox-${name}-icon`,
      {
        cursor: 'pointer'
      },
      {
        type: 'far',
        size: '1x',
        icon: checked ? 'check-square' : 'square'
      }
    ));

    _appendChild(component, cText(
      `${_project}-checkbox-${name}-text`,
      { },
      {
        text: title
      }
    ));

    component.addEventListener('click', _checkboxClick);

    return component;
  };

  const cIconWithText = (id, style = {}, ext = {}) => {
    const { name, icon, type, text, onclick } = ext;

    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIcon(
      `${_project}-${name}-icon`,
      {
        cursor: 'pointer'
      },
      {
        type: type,
        size: '1x',
        icon: icon
      }
    ));

    _appendChild(component, cText(
      `${_project}-${name}-text`,
      { },
      {
        text: text
      }
    ));

    if (onclick) {
      component.addEventListener('click', onclick);
    }

    return component;
  };

  const cExpandIcon = (id, style = {}, ext = {}) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIcon(
      `${_project}-expand-icon`,
      {
        cursor: 'pointer'
      },
      {
        type: 'fas',
        size: '1x',
        icon: _storage.expand ? 'angle-right' : 'angle-left'
      }
    ));

    component.addEventListener('click', _expandClick);

    return component;
  };

  const cTrackerIcon = (id, style = {}, ext = {}) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIcon(
      `${_project}-tracker-icon`,
      {
        cursor: 'pointer'
      },
      {
        type: 'far',
        size: '1x',
        icon: 'list-alt'
      }
    ));

    component.addEventListener('click', () => {
      document.location.href = 'https://www.linux.org.ru/tracker/';
    });

    return component;
  };

  const cTalksIcon = (id, style = {}, ext = {}) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIcon(
      `${_project}-talks-icon`,
      {
        cursor: 'pointer'
      },
      {
        type: 'fas',
        size: '1x',
        icon: 'fire'
      }
    ));

    component.addEventListener('click', () => {
      document.location.href = 'https://www.linux.org.ru/forum/talks/';
    });

    return component;
  };

  const cScore = (id, style = {}, ext = {}) => {
    const { up, down, vote, item } = ext;

    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIconWithText(
      `${_project}-score-${item}-up`,
      {
        cursor: 'pointer',
        display: 'none'
      },
      {
        name: `score-${item}-up`,
        icon: 'thumbs-up',
        type: vote === 'up' ? 'fas' : 'far',
        text: up,
        onclick: () => {
          voteTopic(item, vote === 'up' ? 'zero' : 'up')
        }
      }
    ));

    _appendChild(component, cText(
      `${_project}-score-${item}-divider`,
      {
        display: 'none'
      },
      {
        text: '&nbsp;&nbsp;&nbsp;'
      }
    ));

    _appendChild(component, cIconWithText(
      `${_project}-score-${item}-down`,
      {
        cursor: 'pointer',
        display: 'none'
      },
      {
        name: `score-${item}-down`,
        icon: 'thumbs-down',
        type: vote === 'down' ? 'fas' : 'far',
        text: down,
        onclick: () => {
          voteTopic(item, vote === 'down' ? 'zero' : 'down')
        }
      }
    ));

    _appendChild(component, cIconWithText(
      `${_project}-score-${item}-cons`,
      {
        cursor: 'pointer'
      },
      {
        name: `score-${item}-cons`,
        icon: 'hand-point-right',
        type: 'far',
        text: up - down,
      }
    ));

    component.addEventListener('mouseenter', _scoreOnMouseEnter);
    component.addEventListener('mouseleave', _scoreOnMouseLeave);

    return component;
  };

  const cKarma = (id, style = {}, ext = {}) => {
    const { up, down, vote, user } = ext;

    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    _appendChild(component, cIconWithText(
      `${_project}-karma-${user}-up`,
      {
        cursor: 'pointer',
        display: 'none'
      },
      {
        name: `karma-${user}-up`,
        icon: 'thumbs-up',
        type: vote === 'up' ? 'fas' : 'far',
        text: up,
        onclick: () => {
          voteKarma(user, vote === 'up' ? 'zero' : 'up');
        }
      }
    ));

    _appendChild(component, cText(
      `${_project}-karma-${user}-divider`,
      {
        display: 'none'
      },
      {
        text: '&nbsp;&nbsp;&nbsp;'
      }
    ));

    _appendChild(component, cIconWithText(
      `${_project}-karma-${user}-down`,
      {
        cursor: 'pointer',
        display: 'none'
      },
      {
        name: `karma-${user}-down`,
        icon: 'thumbs-down',
        type: vote === 'down' ? 'fas' : 'far',
        text: down,
        onclick: () => {
          voteKarma(user, vote === 'down' ? 'zero' : 'down')
        }
      }
    ));

    if (up === down) {
      var icon = 'meh';
    } else {
      icon = up > down ? 'smile' : 'frown';
    }

    _appendChild(component, cIcon(
      `${_project}-karma-${user}-cons`,
      {
        cursor: 'pointer',
        display: 'inline'
      },
      {
        icon: icon,
        type: 'far',
        size: '1x'
      }
    ));

    component.addEventListener('mouseenter', _karmaOnMouseEnter);
    component.addEventListener('mouseleave', _karmaOnMouseLeave);

    return component;
  };

  const cPanelBody = (id, style = {}, ext = {}) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    Object.keys(_storage.items).map(item => {
      const { title, state } = _storage.items[item];
      _appendChild(component, cCheckBox(
        `${_project}-checkbox-${item}`,
        {},
        {
          name: item,
          title: title,
          checked: state
        }
      ));
    });

    return component;
  };

  const cPanelHeader = (id, style = {}, ext = {}) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);
    _appendChild(component, cIcon(
      `${_project}-icon-up`,
      {
        cursor: 'pointer'
      },
      {
        type: 'fas',
        size: '1x',
        icon: 'arrow-circle-up',
        onclick: _goTopPage
      }
    ));
    _appendChild(component, cExpandIcon(
      `${_project}-expand-button`,
      {
        'margin-top': '0.5em'
      }
    ));

    // Devel mode
    if (_storage.items.develmode.state) {
      _appendChild(component, cTrackerIcon(
        `${_project}-tracker-button`,
        {
          'margin-top': '0.5em'
        }
      ));
      _appendChild(component, cTalksIcon(
        `${_project}-talks-button`,
        {
          'margin-top': '0.5em'
        }
      ));
    }

    _appendChild(component, cIcon(
      `${_project}-icon-down`,
      {
        'margin-top': '0.5em',
        cursor: 'pointer'
      },
      {
        type: 'fas',
        size: '1x',
        icon: 'arrow-circle-down',
        onclick: _goBottomPage
      }
    ));

    return component;
  };

  const cPanel = (id, style) => {
    const component = document.createElement('div');
    component.id = id;
    component.style.cssText = _style2cssText(style);

    component.addEventListener('mousedown', _dragStart);
    window.addEventListener('mouseup', _dragEnd);

    _appendChild(component, cPanelBody(
      `${_project}-panel-body`,
      {
        'background-color': 'rgba(0, 0, 0, 0.42)',
        padding: '0.5em',
        'border-radius': '0.75em',
        display: _storage.expand ? '' : 'none'
      }
    ));

    _appendChild(component, cPanelHeader(
      `${_project}-panel-header`,
      {
        'background-color': 'rgba(0, 0, 0, 0.42)',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        padding: '0.5em',
        'border-radius': '0.75em',
      }
    ));

    return component;
  };

  /* Components --- */


  /* Injects */

  const injPanel = () => {
    const { right, top } = _storage.position;

    const panelStyle = {
      position: 'fixed',
      right: right + 'px',
      top: top + 'px',
      'padding-top': '1em',
      'z-index': 100,
      cursor: 'move',
      display: 'flex'
    };
    _appendChild(document.querySelector('body'),
                 cPanel(`${_project}-main-panel`, panelStyle));
  };

  const injScoresForTopics = data => {
    Object.keys(data).map(item => {
      var article = document.getElementById(`comment-${item}`);
      if (!article) {
        article = document.getElementById(`topic-${item}`);
      }
      if (!article) {
        return;
      }

      const style = {
        'float': 'right',
        'border-radius': '0.5em',
        padding: '0.25em',
        'background-color': 'rgba(0, 0, 0, 0.12)',
        display: 'flex'
      };
      const ext = Object.assign({}, data[item], {item: item});
      _appendChild(article.getElementsByClassName('sign')[0],
                   cScore(`${_project}-score-${item}`, style, ext));
    });
  };

  const injScore = () => {
    if (!_storage.items.score.state) {
      return;
    }

    var articles = [...document.querySelectorAll('article.msg')].map(item => {
      return item.id.split('-')[1];
    });

    fetchScores(articles);
  };

  const injKarmaForUser = data => {
    Object.keys(data).map(user => {
      const karma = data[user];

      [...document.querySelectorAll('a')].filter(item => {
        return item.href.indexOf('people') !== -1 && item.text === user;
      }).map((item, i) => {
        const parent = item.parentNode;

        const style = {
          'border-radius': '0.5em',
          padding: '0.5em',
          display: 'inline'
        };
        const ext = Object.assign({}, karma, {user: user});
        _insertAfter(parent, cKarma(`${_project}-karma-${user}`, style, ext), item);
      });
    });
  };

  const injKarma = () => {
    if (!_storage.items.karma.state) {
      return;
    }

    var names = [...document.querySelectorAll('a')].filter(item => {
      return ((item.href.indexOf('people') !== -1) &&
              (item.href.indexOf('profile') !== -1));
    }).map(item => item.text);

    fetchKarmas(names.filter((item, i) => names.indexOf(item) === i));
  };

  /* Injects --- */

  // remove lorksStorage from localStorage
  // localStorage.removeItem('lorkaStorage');

  _init();
  injPanel();
  injScore();
  injKarma();

})();
