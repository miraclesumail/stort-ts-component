
// 异步方案：
// 该方案实际上是用padding代替本来应该存在的可视区域之外的dom元素
// 因此往回渲染之前已经浏览过的位置时，前端需要缓存之前的数据实现同步渲染，不缓存之前的数据重新请求进行异步渲染则需要采用墓碑避免出现空白
// 而第一次渲染不存在的区域，则可以进行loading异步渲染（组件需要为外部添加标志位试试）
export default class ListScroll {
    public changeIndex;

    constructor(options) {
        this.opsCheck(options);
    }

    // 传入属性检查
    opsCheck(ops) {
        if (!ops || typeof ops !== 'object') {
            throw new Error('options are illegal');
        }

        // options
        const {
            firstItemId,
            lastItemId,
            itemHeight,
            container,
            size,
            showNum,
            changeIndex
        } = ops;

        if (!firstItemId) {
            throw new Error('firstItemId can not be null');
        }

        if (!lastItemId) {
            throw new Error('lastItemId can not be null');
        }

        if (!itemHeight || typeof itemHeight !== 'number') {
            throw new Error('itemHeight is illegal');
        }

        // if (!listSize) {
        //     throw new Error('listSize is illegal');
        // }

        if (!container || !container.nodeType) {
            throw new Error('root is illegal');
        }

        this.itemHeight = itemHeight;
        this.firstItemId = firstItemId;
        this.lastItemId = lastItemId;
        this.container = container;
        this.listSize = showNum + 1;
        this.showNum = showNum;
        this.size = size;
        this.changeIndex = changeIndex;

        this.firstItem = document.getElementById(firstItemId);
        this.lastItem = document.getElementById(lastItemId);

        this.domDataCache = {
            currentPaddingTop: 0,
            currentPaddingBottom: 0,
            topSentinelPreviousY: 0,
            topSentinelPreviousRatio: 0,
            bottomSentinelPreviousY: 0,
            bottomSentinelPreviousRatio: 0,
            currentIndex: 0
        };
    }

    updateDomDataCache(params) {
        Object.assign(this.domDataCache, params);
    }

    // 动态调整容器padding实现滚动
    adjustPaddings(isScrollDown) {
        const { container, itemHeight } = this;
        const { currentPaddingTop, currentPaddingBottom } = this.domDataCache;

        let newCurrentPaddingTop, newCurrentPaddingBottom;

        // TODO 150待抽象
        const remPaddingsVal = itemHeight * (Math.floor(this.listSize / 2));

        if (isScrollDown) {
            newCurrentPaddingTop = currentPaddingTop + remPaddingsVal;

            if (currentPaddingBottom === 0) {
                newCurrentPaddingBottom = 0;
            } else {
                newCurrentPaddingBottom = currentPaddingBottom - remPaddingsVal;
            }
        } else {
            newCurrentPaddingBottom = currentPaddingBottom + remPaddingsVal;

            if (currentPaddingTop === 0) {
                newCurrentPaddingTop = 0;
            } else {
                newCurrentPaddingTop = currentPaddingTop - remPaddingsVal;
            }
        }

        container.style.paddingBottom = `${newCurrentPaddingBottom}px`;
        container.style.paddingTop = `${newCurrentPaddingTop}px`;

        this.updateDomDataCache({
            currentPaddingTop: newCurrentPaddingTop,
            currentPaddingBottom: newCurrentPaddingBottom
        });
    }

    getWindowFirstIndex = (isScrollDown) => {
        const {
            currentIndex
        } = this.domDataCache;

        // 以全部容器内所有元素的一半作为增量
        const increment = Math.floor(this.listSize / 2);

        let firstIndex;

        if (isScrollDown) {
            firstIndex = currentIndex + increment;
        } else {
            firstIndex = currentIndex - increment;
        }

        if (firstIndex < 0) {
            firstIndex = 0;
        }

        return firstIndex;
    }

    topItemCb(entry) {
        const {
            topSentinelPreviousY,
            topSentinelPreviousRatio
        } = this.domDataCache;

        const currentY = entry.boundingClientRect.top;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;
        
        // 上滑精准判定 =>
        // 保证是在隐藏后再次上拉出现第一个、并且再currentIndex变化(currentIndex !== 0)之后，
        // 否则可能反复（隐藏 -> 出现) 的操作出现多次rendering
        if (
            currentY >= topSentinelPreviousY
            && isIntersecting
            && currentRatio >= topSentinelPreviousRatio
        ) {
            // 第一个firstItem进来时触发
            console.log('first item in');
            const firstIndex = this.getWindowFirstIndex(false);
            this.changeIndex(firstIndex);
            this.adjustPaddings(false);

            this.updateDomDataCache({
                currentIndex: firstIndex,
                topSentinelPreviousY: currentY,
                topSentinelPreviousRatio: currentRatio
            });
        } else {
            // 第一个firstItem完全进入触发
            console.log('first item all in');
            this.updateDomDataCache({
                topSentinelPreviousY: currentY,
                topSentinelPreviousRatio: currentRatio
            });
        }
    }

    bottomItemCb(entry) {
        console.log('bottomItemCbbottomItemCbbottomItemCb')
        const {
            bottomSentinelPreviousY,
            bottomSentinelPreviousRatio
        } = this.domDataCache;

        const currentY = entry.boundingClientRect.top;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;

        // 下滑精准判定 => TODO 更深入明确理解
        if (
            currentY <= bottomSentinelPreviousY
            && currentRatio >= bottomSentinelPreviousRatio
            && isIntersecting
        ) {
            console.log('botSentCallback.. go');
            const firstIndex = this.getWindowFirstIndex(true);

            if (firstIndex + this.showNum > this.size) {
                return
            }
            this.changeIndex(firstIndex);

            this.adjustPaddings(true);

            this.updateDomDataCache({
                currentIndex: firstIndex,
                bottomSentinelPreviousY: currentY,
                bottomSentinelPreviousRatio: currentRatio
            });
        } else {
            // console.log('botSentCallback.. go111');

            this.updateDomDataCache({
                bottomSentinelPreviousY: currentY,
                bottomSentinelPreviousRatio: currentRatio
            });
        }
    }

    // 节点监测
    initIntersectionObserver() {
        // 观察元素开始进入视窗或者完全离开视窗的时候都会触发
        const callback = (entries) => {
            console.log(entries, 'entriesentriesentries')
            entries.forEach((entry) => {
                if (entry.target.id === this.firstItemId) {
                    this.topItemCb(entry);
                } else if (entry.target.id === this.lastItemId) {
                    console.log('lastItem is entering', entry)
                    this.bottomItemCb(entry);
                }
            });
        };

        this.observer = new IntersectionObserver(callback, {});

        // 观察列表第一个以及最后一个元素
        this.observer.observe(this.firstItem);
        this.observer.observe(this.lastItem);
    }

    // 开始监测
    startObserver() {
        this.initIntersectionObserver();
    }

    // 停止监测
    // stopObserver() {}
}
