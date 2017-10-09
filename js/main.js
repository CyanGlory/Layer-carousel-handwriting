/**
 * 图层式的轮播图
 * 由控制器 Carousel 和 元素 CarouselItem 构成
 * 如果采用淡入淡出来制作动画, 效果会有所不同.
 */

/* ----- ----- ----- ----- CarouselItem - start ----- ----- ----- ----- */

function CarouselItem(imgSrc, originalPosition) {
  const img = document.createElement('img');
  img.setAttribute('src', imgSrc);
  img.setAttribute('class', 'carousel-item');
  img.style.left = originalPosition * 100 + '%';

  this.ele = img;
  this.originalPosition = originalPosition;
  this.isShown = originalPosition === 0 ? true : false;
}
/**
 * 告诉每个元素要显示第几个元素, 让他们自己行动
 */
CarouselItem.prototype.sort = function(index) {
  // 清空所有人展示状态
  this.isShown = false;
  // 展示其中一个人
  if (index === this.originalPosition) {
    this.ele.style.left = '0%';
    this.isShown = true;
    return;
  }
  // 当你挡住了需要显示的图片, 请回到自己的位置
  if (index < this.originalPosition) {
    this.ele.style.left = this.originalPosition * 100 + '%';
  }
}

/* ----- ----- ----- ----- CarouselItem - end ----- ----- ----- ----- */


/* ----- ----- ----- ----- Carousel - core - start ----- ----- ----- ----- */
/**
 * 通过配置构建一个 轮播图 实例
 * 
 * @param {Object} option
 * @param {HTMLElement} option.wrapper 容器
 * @param {Array} option.imgSrcList 需要被展示的图片 src 数组.
 * 
 * 可选项
 * @param {Number} option.delay 展示时间 ms.
 * @param {Number} option.startIndex 需要展示的第一个元素(不会改变 imgSrcList 数组中的次序)
 * @param {Number} option.animeTime 动画持续时间, 单位毫秒, 请根据 css - transition 改动.
 * 
 * @inner {Boolean} isAnimating 是否正在过渡
 */
function Carousel(option) {
  var option = typeof option === 'object' ? option : {};
  this.wrapper = option.wrapper;
  var imgSrcList = option.imgSrcList || [];

  this.delay = option.delay || 3000;
  this.index = option.startIndex || 0;
  this.animeTime = option.animeTime || 2000;
  this.isAnimating = false;

  this.items = [];
  imgSrcList.forEach(function(imgSrc, index) {
    const img = new CarouselItem(imgSrc, index);
    this.items.push(img);
    this.wrapper.appendChild(img.ele);
  }, this);
}

/**
 * 自动播放, 实际显示时间为 delay + animeTime(过渡中).
 */
Carousel.prototype.autoPlay = function() {
  var that = this;
  setInterval(function() { that.next(); }, this.delay + this.animeTime);
}

/**
 * 向所有的子元素发起通知, 告知谁需要被显示
 */
Carousel.prototype.show = function(index) {
  var that = this;
  if (this.isAnimating) {
    console.log('isAnimating');
    return;
  }
  // 开始动画, 以及倒计时完成
  this.isAnimating = true;
  setTimeout(function() { that.isAnimating = false; }, this.animeTime);

  var len = this.items.length;
  for(var i = 0; i < len; i = i + 1) {
    var item = this.items[i];
    item.sort(index);
  }
  
  this.index = index;

  // plugins: click control need
  activeCarouselIndex(index);
}

Carousel.prototype.prev = function() {
  if (this.index > 0) this.show(this.index - 1);
  else this.show(this.items.length + 1);  // 显示最后一个元素
}

Carousel.prototype.next = function() {
  if (this.index < this.items.length - 1) this.show(this.index + 1);
  else this.show(0);                      // 显示第一个元素
}

/* ----- ----- ----- ----- Carousel - core - end ----- ----- ----- ----- */


/* ----- ----- ----- ----- Carousel - plugins - start ----- ----- ----- ----- */
// 添加状态栏, 使用计算宽度, 添加子元素, 并提供点击控制
Carousel.prototype.addStatusBar = function() {
  var that = this;
  var len = this.items.length;
  var activeIndex = this.index;
  var $control = document.querySelector('#carousel .control');

  $control.style.width = (len + 1) * 3 + 'em';
  for(var i = 0; i < len; i = i + 1) {
    var $statusIndex = document.createElement('li');
    
    if (activeIndex === i) $statusIndex.setAttribute('class', 'carousel-index active');
    else $statusIndex.setAttribute('class', 'carousel-index');

    $control.appendChild($statusIndex);
  }

  $control.addEventListener('click', function(event){
    var target = event.target;
    var index = getIndex(target);
    if (index === activeIndex) return;
    
    if (target && target.nodeName.toUpperCase() ==="LI") {
      that.show(index);
    }
  });
}

// 辅助函数
function getIndex(ele) {
  if(ele && ele.nodeType && ele.nodeType === 1){
    var $parent = ele.parentNode;
    var $childs = $parent.children;
    for (var i = 0; i < $childs.length; i += 1) {
      if ($childs[i] === ele) {
        return i;
      }
    }
  } else {
    console.log('ele is not a valid dom element: ', ele);
  }
}

function activeCarouselIndex(index) {
  var activeEle = document.querySelector('#carousel .carousel-index.active');
  var $childs = document.querySelectorAll('#carousel .carousel-index');

  activeEle.setAttribute('class', 'carousel-index');
  $childs[index].setAttribute('class', 'carousel-index active');
}


window.onload = function() {
  var carousel = new Carousel({
    wrapper: document.querySelector('#carousel .content'),
    imgSrcList: [
      './image/img-1.jpg', './image/img-2.jpg', './image/img-3.jpg',
      './image/img-1.jpg', './image/img-2.jpg', './image/img-3.jpg'
    ],
    delay: 2000,
  });

  carousel.addStatusBar();
  carousel.autoPlay();
}

