function swap (arr: number[], x: number, y: number) {
    let tmp: number = arr[x];
    arr[x] = arr[y];
    arr[y] = tmp;
}

// 冒泡排序
function bubbleSort(arr: number[]): number[] {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
            }
        }
    }

    return arr;
}

// 快速排序-递归
function quickSort(arr: number[], low: number, high: number): number[] {
    let pivot = partition(arr, low, high);

    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);

    return arr;
}

// 快速排序-非递归
function quickSortIteration(arr: number[], low: number, high: number): number[] {
    let map = new Map();
    let stack = [];

    map.set('low', low);
    map.set('high', high);
    stack.push(map);

    while (stack.length > 0) {
        let map = stack.pop();
        let _low = map?.get('low');
        let _high = map?.get('high');
        let pivot = partition(arr, _low, _high);

        if (_low < pivot - 1) {
            let map = new Map();
            map.set('low', _low);
            map.set('high', pivot - 1);
            stack.push(map);
        }

        if (pivot + 1 < _high) {
            let map = new Map();
            map.set('low', pivot + 1);
            map.set('high', _high);
            stack.push(map);
        }
    }

    return arr;
}

function partition(arr: number[], low: number, high: number): number {
    let pivot = arr[high];;
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            swap(arr, ++i, j);
        }
    }

    swap(arr, i + 1, high);
    return i + 1;
}

// 选择排序
function selectionSort(arr: number[]): number[] {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < len; j++) {
            minIndex = arr[j] < arr[minIndex] ? j : minIndex;
        }

        swap(arr, minIndex, i);
    }

    return arr;
}

// 插入排序
function insertionSort(arr: number[]): number[] {
    for (let i = 1; i < arr.length; i++) {
        let cur = arr[i];
        let j = i - 1;
        while(cur < arr[j] && j >= 0) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = cur;
    }

    return arr;
}

// 归并排序
function mergeSort(arr: number[], left: number, right: number): number[] {
    if (left >= right) return arr;
    let i = 0,
        help = [],
        mid = left + (right - left) >> 1,
        p1 = left,
        p2 = mid + 1;

    mergeSort(arr, left, mid);
    mergeSort(arr, p2, right);

    while (p1 <= mid && p2 <= right) {
        help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
    }

    while (p1 <= mid) {
        help[i++] = arr[p1++];
    }

    while (p2 <= right) {
        help[i++] = arr[p2++];
    }

    for (let i = 0; i < help.length; i++) {
        arr[left + i] = help[i];
    }

    return arr;
}

// 堆排序
function heapSort(arr: number[]) {
    let len = arr.length;

    // build heap
    for (let i = len >> 1 - 1; i >= 0; i--) {
        heapify(arr, len, i);
    }

    // 堆排序
    for (let i = len - 1; i > 0; i--) {
        swap(arr, 0, i);

        heapify(arr, i, 0);
    }

    return arr;
}

function heapify(arr: number[], n: number, i: number) {
    let max = i,
    l = 2 * i + 1,
    r = 2 * i + 2;

    if (l < n && arr[l] > arr[max]) {
        max = l;
    }

    if (r < n && arr[r] > arr[max]) {
        max = r;
    }

    if (max !== i) {
        swap(arr, max, i);

        heapify(arr, n, max);
    }
}

// 计数排序
function countSort(arr: number[]): number[] {
    // 1. 得到数组最大值
    let max = arr[0];
    let res = []
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }

    // 2. 根据数组最大值确定统计数组的长度
    const countArr = new Array(max + 1).fill(0);

    // 3. 遍历数组，填充统计数组
    for (let i = 0; i < arr.length; i++) {
        countArr[arr[i]]++;
    }
    // 遍历统计数组，输出结果
    for (let i = 0; i < countArr.length; i++) {
        for (let j = 0; j < countArr[i]; j++) {
            res.push(i);
        }
    }

    return res;
}

// 计数排序优化
function countSort2(arr: number[]): number[] {
    let max = arr[0],
        min = arr[0];
    const len = arr.length;
    const res = new Array(len).fill(null);
    
    // 1. 获取数组最大最小值
    for (let i = 0; i < len; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    const d = max - min;

    // 2. 创建统计数组并遍历数组进行填充；
    const countArr = new Array(d + 1).fill(0);
    for (let i = 0; i < len; i++) {
        countArr[arr[i] - min]++;
    }

    // 3. 为统计数组做变形
    for (let i = 1; i < countArr.length; i++) {
        countArr[i] += countArr[i - 1];
    }

    // 4. 倒序遍历原始数组，从统计数组中找出正确位置，输出到结果数组
    for (let i = arr.length - 1; i >= 0; i--) {
        let index = countArr[arr[i] - min];
        countArr[arr[i] - min]--;
        res[index] = arr[i];
    }

    return arr;
}


class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = val === undefined ? 0 : val;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
    }

}

// 前、中、后序遍历-递归
function traversal(root: TreeNode | null) {
    if (root) {
        // 前序遍历
        console.log(root.val);
        traversal(root.left);
        // 中序遍历
        // console.log(root.val);
        traversal(root.right);
        // 后序遍历
        // console.log(root.val);
    }
}

// 前序遍历-非递归
function preTraversal(root: TreeNode | null) {
    if (!root) return null;

    let stack: TreeNode[] = [];
    stack.push(root);

    while (stack.length > 0) {
        let node = stack.pop();
        console.log(node?.val);
        if (node?.right) {
            stack.push(node.right);
        }

        if (node?.left) {
            stack.push(node.left);
        }
    }
}

function midTraversal(root: TreeNode | null) {
    if (!root) return root;

    let s = [];
    let cur: TreeNode | null = root;

    while (s.length > 0 || cur) {
        if (cur) {
            s.push(cur);
            cur = cur.left;
        } else {
            cur = s.pop() as TreeNode;
            console.log(cur.val);
            cur = cur.right;
        }
    }

}

function postTraversal(root: TreeNode | null) {
    if (!root) return root;
    let s1 = []; // 入栈顺序：根、左、右 出栈顺序：根、右、左
    let s2 = []; // 出栈顺序：左、右、根
    let node = root;
    s1.push(node);

    while (s1.length > 0) {
        node = s1.pop() as TreeNode;
        s2.push(node);

        if (node.left) {
            s1.push(node.left);
        }

        if (node.right) {
            s1.push(node.right);
        }
    }

    while (s2.length > 0) {
        node = s2.pop() as TreeNode;
        console.log(node.val);
    }
}





const baseArr: number[] = [10, 80, 30, 90, 40, 50, 70];
const testArr: number[] = [6, 1, 7, 3, 5, 4, 10, 2, 8];

console.log(`testArrs are: , ${baseArr}, \n ${testArr}`);
// console.log(`bubbleSort arr: ${bubbleSort(testArr)}`);
// console.log(`quickSort arr: ${quickSort(baseArr, 0, baseArr.length - 1)}`);
// console.log(`quickSort arr: ${quickSortIteration(baseArr, 0, testArr.length - 1)}`);
// console.log(`selectionSort arr: ${selectionSort(baseArr)}`);
// console.log(`insertion arr: ${insertionSort(testArr)}`);
// console.log(`insertion arr: ${mergeSort(testArr, 0, testArr.length - 1)}`);
console.log(`heapSort arr: ${heapSort(baseArr)}`)

// 0-1背包问题
function knapsack(w: number[], v: number[], C: number): number {
    let len = 0;
    if (len === 0) return 0;

    // 第一维代表物品重量，第二维代表剩余总容量
    let arr = new Array(len).fill(new Array(C + 1).fill(null));

    // 完成子问题的求解, i代表剩余容量，arr[0]代表物品1
    for (let i = 0; i <= C; i++) {
        arr[0][i] = i >= w[0] ? v[0] : 0;
    }

    for (let i = 1; i < len; i++) {
        for (let j = 0; j <= C; j++) {
            // 默认先不放该物品，故取上一行的值
            arr[i][j] = arr[i-1][j];

            if (j >= w[i]) {
                arr[i][j] = Math.max(arr[i][j], v[i] + arr[i-1][j - w[i]]);
            }
        }
    }

    return arr[len - 1][C];
}
