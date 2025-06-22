# React Formula Editor Advanced

[![NPM version](https://img.shields.io/npm/v/react-formula-editor-advanced.svg?style=flat)](https://www.npmjs.com/package/react-formula-editor-advanced)
[![NPM downloads](https://img.shields.io/npm/dm/react-formula-editor-advanced.svg?style=flat)](https://www.npmjs.com/package/react-formula-editor-advanced)

A flexible and powerful formula editor component for React, supporting custom metrics, real-time syntax highlighting, and complex calculations. It's designed to be easy to integrate and customize.

---

## 中文简介

`react-formula-editor-advanced` 是一个功能强大且灵活的 React 公式编辑器组件。它支持自定义指标、实时语法高亮和复杂的数学运算，旨在提供简单集成和高度可定制的开发体验。

### ✨ 特性

- **自定义指标**：轻松定义和插入自定义变量或函数。
- **语法高亮**：实时高亮公式中的指标、运算符和括号。
- **智能提示**：输入 `#` 即可触发指标下拉菜单，支持模糊搜索。
- **键盘导航**：通过键盘快捷键（上/下/Enter）快速选择指标。
- **灵活的 API**：通过 `ref` 暴露常用方法，如 `focus()`, `getValue()`, `setValue()`。
- **样式可定制**：基于 CSS Modules 和 Less，轻松覆盖默认样式。

### 📦 安装

```bash
npm install react-formula-editor-advanced
# or
yarn add react-formula-editor-advanced
```

### 🚀 使用

```jsx
import React, { useState, useRef } from "react";
import { FormulaEditor } from "react-formula-editor-advanced";
import "react-formula-editor-advanced/dist/style.css";

const App = () => {
  const [value, setValue] = useState("");
  const editorRef = useRef(null);

  const metricOptions = [
    { key: "metric1", name: "指标一" },
    { key: "metric2", name: "指标二" },
  ];

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <FormulaEditor
      ref={editorRef}
      value={value}
      onChange={handleChange}
      metricOptions={metricOptions}
      placeholder="输入#选择指标..."
    />
  );
};

export default App;
```

### API

#### Props

| 属性            | 说明                          | 类型                                 | 默认值               |
| --------------- | ----------------------------- | ------------------------------------ | -------------------- |
| `value`         | 编辑器的当前值（HTML 字符串） | `string`                             | `''`                 |
| `onChange`      | 值变化时的回调函数            | `(value: string) => void`            | -                    |
| `metricOptions` | 自定义指标选项数组            | `Array<{key: string, name: string}>` | `[]`                 |
| `placeholder`   | 占位符文本                    | `string`                             | `'输入#选择指标...'` |

#### Ref Methods

| 方法                     | 说明                         |
| ------------------------ | ---------------------------- |
| `focus()`                | 让编辑器获得焦点             |
| `getEditorRef()`         | 获取编辑器 `div` 的 DOM 引用 |
| `getValue()`             | 获取纯文本公式               |
| `setValue(html: string)` | 设置编辑器的内容             |

---

## English Introduction

`react-formula-editor-advanced` is a powerful and flexible formula editor component for React. It supports custom metrics, real-time syntax highlighting, and complex mathematical operations, designed for easy integration and high customizability.

### ✨ Features

- **Custom Metrics**: Easily define and insert custom variables or functions.
- **Syntax Highlighting**: Real-time highlighting for metrics, operators, and parentheses.
- **Intelligent Suggestions**: Type `#` to trigger a dropdown menu of metrics with fuzzy search.
- **Keyboard Navigation**: Quickly select metrics using keyboard shortcuts (Up/Down/Enter).
- **Flexible API**: Exposes common methods like `focus()`, `getValue()`, and `setValue()` via `ref`.
- **Customizable Styles**: Easily override default styles with CSS Modules and Less.

### 📦 Installation

```bash
npm install react-formula-editor-advanced
# or
yarn add react-formula-editor-advanced
```

### 🚀 Usage

```jsx
import React, { useState, useRef } from "react";
import { FormulaEditor } from "react-formula-editor-advanced";
import "react-formula-editor-advanced/dist/style.css";

const App = () => {
  const [value, setValue] = useState("");
  const editorRef = useRef(null);

  const metricOptions = [
    { key: "metric1", name: "Metric One" },
    { key: "metric2", name: "Metric Two" },
  ];

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <FormulaEditor
      ref={editorRef}
      value={value}
      onChange={handleChange}
      metricOptions={metricOptions}
      placeholder="Type # to select a metric..."
    />
  );
};

export default App;
```

### API

#### Props

| Prop            | Description                                   | Type                                 | Default                          |
| --------------- | --------------------------------------------- | ------------------------------------ | -------------------------------- |
| `value`         | The current value of the editor (HTML string) | `string`                             | `''`                             |
| `onChange`      | Callback function when the value changes      | `(value: string) => void`            | -                                |
| `metricOptions` | Array of custom metric options                | `Array<{key: string, name: string}>` | `[]`                             |
| `placeholder`   | Placeholder text                              | `string`                             | `'Type # to select a metric...'` |

#### Ref Methods

| Method                   | Description                                 |
| ------------------------ | ------------------------------------------- |
| `focus()`                | Focuses the editor.                         |
| `getEditorRef()`         | Gets the DOM reference of the editor `div`. |
| `getValue()`             | Gets the plain text formula.                |
| `setValue(html: string)` | Sets the content of the editor.             |

### 📜 License

This project is licensed under the MIT License.
