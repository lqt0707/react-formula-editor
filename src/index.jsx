import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Input } from "antd";
import style from "./style.module.less";

// 将公式转换为标签显示
export const convertFormulaToTags = (formula, metricOptions = []) => {
  if (!formula) return "";

  // 先将所有指标按key降序排序，避免部分key包含关系导致替换错误
  const sortedMetrics = [...metricOptions].sort(
    (a, b) => b.key.length - a.key.length
  );
  // 构造正则表达式，匹配所有指标key
  const metricKeys = sortedMetrics.map((m) =>
    m.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (metricKeys.length === 0) return formula;
  const reg = new RegExp(`(${metricKeys.join("|")})`, "g");

  // 只替换指标部分为标签，其他运算符和空格保留
  return formula.replace(reg, (match) => {
    const metric = sortedMetrics.find((m) => m.key === match);
    if (metric) {
      return `<span class=\"${style.tag}\" data-key=\"${metric.key}\">${metric.name}</span>`;
    }
    return match;
  });
};

/**
 * 公式编辑器组件
 * @param {Object} props - 组件属性
 * @param {string} props.value - 当前值
 * @param {Function} props.onChange - 值变化回调
 * @param {Array} props.metricOptions - 指标选项数组
 * @param {string} props.placeholder - 占位符文本
 */
export const FormulaEditor = forwardRef((props = {}, ref) => {
  const {
    value = "",
    onChange,
    metricOptions = [],
    placeholder = "输入#选择指标，支持数值类型指标的加减乘除运算",
  } = props;

  const editorRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 过滤指标选项
  const filteredMetrics = metricOptions.filter(
    (metric) =>
      !searchText ||
      metric.name.toLowerCase().includes(searchText.toLowerCase()) ||
      metric.key.toLowerCase().includes(searchText.toLowerCase())
  );

  // 添加处理点击事件，防止光标进入标签
  const handleEditorClick = (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains(style.tag)) {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection) return;

      const range = document.createRange();

      const nextNode = target.nextSibling;
      if (nextNode) {
        range.setStartBefore(nextNode);
        range.setEndBefore(nextNode);
      } else {
        const textNode = document.createTextNode("");
        if (target.parentNode) {
          target.parentNode.appendChild(textNode);
        }
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
      }

      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // 处理指标选择
  const handleMetricSelect = (metric) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = window.getSelection();
    const content = editor.textContent;
    const lastIndex = content.lastIndexOf("#");

    if (lastIndex === -1) return;

    const range = document.createRange();
    let hashNode = null;
    let hashOffset = 0;
    let foundHash = false;

    const findHashInNode = (node, startOffset = 0) => {
      if (foundHash) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || "";
        const hashPos = textContent.indexOf("#", startOffset);
        if (hashPos !== -1) {
          hashNode = node;
          hashOffset = hashPos;
          foundHash = true;
          return;
        }
      }

      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          findHashInNode(node.childNodes[i]);
          if (foundHash) return;
        }
      }
    };

    findHashInNode(editor);

    if (!hashNode) return;

    range.setStart(hashNode, hashOffset);
    range.setEnd(hashNode, hashOffset + 1);
    range.deleteContents();

    const metricSpan = document.createElement("span");
    metricSpan.className = style.tag;
    metricSpan.textContent = metric.name;
    metricSpan.setAttribute("data-key", metric.key);
    range.insertNode(metricSpan);

    // const space = document.createTextNode('\u00A0'); // html空格
    const space = document.createTextNode("\u200B"); // 零宽度空格
    metricSpan.after(space);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.setEndAfter(space);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    setShowDropdown(false);
    setSearchText("");
    if (editor) {
      editor.focus();
    }

    // 触发onChange
    triggerChange();
  };

  // 触发onChange事件
  const triggerChange = () => {
    // if (!editorRef.current || !onChange) return;
    // const editor = editorRef.current;
    // const tags = editor.getElementsByClassName(style.tag);
    // let formula = editor.innerHTML;
    // Array.from(tags).forEach((tag) => {
    //   const key = tag.getAttribute('data-key');
    //   formula = formula.replace(tag.outerHTML, key);
    // });
    // onChange(editorRef.current?.innerHTML || '');
    // editorRef.current?.focus();
  };

  // 修改键盘事件监听，确保在输入#时显示下拉框
  const handleEditorKeyUp = (e) => {
    if (e.key === "#") {
      setTimeout(() => {
        setShowDropdown(true);
        setSearchText("");
      }, 0);
    }
  };

  // 处理编辑器输入
  const handleEditorInput = (e) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;

    const content = editor.textContent || "";

    if (
      e.inputType === "deleteContentBackward" ||
      e.inputType === "deleteContentForward" ||
      e.nativeEvent.inputType === "deleteContentBackward" ||
      e.nativeEvent.inputType === "deleteContentForward"
    ) {
      const selectedNode = range.startContainer.parentNode;

      if (selectedNode && selectedNode.className === style.tag) {
        e.preventDefault();
        handleTagRemoval(selectedNode, range, selection);
      }
      if (selection.anchorNode === editorRef.current) {
        e.preventDefault();
        // handleTagRemoval(editorRef.current, range, selection);
      }
    }

    if (content.includes("#")) {
      const lastHashIndex = content.lastIndexOf("#");
      const textAfterHash = content.substring(lastHashIndex + 1).trim();
      if (textAfterHash === "") {
        setShowDropdown(true);
        setSearchText("");
      }
    } else {
      setShowDropdown(false);
    }

    triggerChange();
  };

  /**
   * 处理标签删除
   * 当用户从编辑器中删除标签时，此函数被调用，它负责调整DOM以保持光标位置，并确保编辑器状态的正确更新
   * @param {Node} node - 被删除的标签节点
   * @param {Range} range - 删除操作前的范围对象，表示用户选择的文本范围
   * @param {Selection} selection - 当前的选区对象，用于后续重新设置光标位置
   */
  const handleTagRemoval = (node, range, selection) => {
    // 检查节点及其父节点的存在性，如果不存在则直接返回
    if (!node || !node.parentNode) return;

    // 保存当前光标位置
    const savedRange = range.cloneRange();

    // 获取被删除节点的父节点、下一个兄弟节点和上一个兄弟节点
    const parent = node.parentNode;
    const nextSibling = node.nextSibling;
    const prevSibling = node.previousSibling;

    // 创建一个空文本节点，用于放置光标
    const cursorTextNode = document.createTextNode("");

    // 删除标签前，先插入光标文本节点
    parent.insertBefore(cursorTextNode, node);
    node.remove();

    // 规范化DOM，合并相邻的文本节点
    parent.normalize();

    // 设置光标位置
    const newRange = document.createRange();
    newRange.setStart(cursorTextNode, 0);
    newRange.setEnd(cursorTextNode, 0);
    selection.removeAllRanges();
    selection.addRange(newRange);

    // 确保编辑器获得焦点
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // 恢复光标位置
    setTimeout(() => {
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }, 0);

    // 触发onChange事件
    triggerChange();
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    // 检查按下的键是否是 Backspace 或 Delete
    if (e.key === "Backspace" || e.key === "Delete") {
      // 获取当前选中的文本范围
      const selection = window.getSelection();
      // 如果没有选中的范围，直接返回
      if (!selection || selection.rangeCount === 0) return;

      // 获取选中的第一个范围
      const range = selection.getRangeAt(0);
      // 获取范围的起始节点
      const node = range.startContainer;
      // 获取范围的起始偏移量
      const offset = range.startOffset;

      // 初始化要移除的标签为 null
      let tagToRemove = null;
      // 当前节点初始化为起始节点
      let currentNode = node;

      // 检查当前节点是否是标签或标签的子节点
      while (currentNode && currentNode !== editorRef.current) {
        // 如果当前节点包含指定的标签类名，则将其设为要移除的标签
        if (
          currentNode &&
          currentNode.classList &&
          currentNode.classList.contains(style.tag)
        ) {
          tagToRemove = currentNode;

          break;
        }
        // 否则，将当前节点设为其父节点，继续检查
        currentNode = currentNode.parentNode;
      }

      // 检查光标前面的节点是否是标签
      if (!tagToRemove && node.nodeType === Node.TEXT_NODE && offset === 0) {
        // 获取光标前面的节点
        let prevNode = node.previousSibling;
        // 如果前面的节点包含指定的标签类名，则将其设为要移除的标签
        if (
          prevNode &&
          prevNode.classList &&
          prevNode.classList.contains(style.tag)
        ) {
          tagToRemove = prevNode;
        }
      }

      // 检查光标前面的字符是否是空格，且前面的节点是否是标签
      if (!tagToRemove && node.nodeType === Node.TEXT_NODE && offset > 0) {
        // 获取光标前面的文本内容
        const textContent = node.textContent || "";
        const textBefore = textContent.substring(0, offset);
        // 如果前面的文本以空格或不间断空格结尾
        if (textBefore.endsWith(" ") || textBefore.endsWith("\u200B")) {
          // 获取光标前面的节点
          let prevNode = node.previousSibling;
          // 如果前面的节点包含指定的标签类名，则将其设为要移除的标签
          if (
            prevNode &&
            prevNode.classList &&
            prevNode.classList.contains(style.tag)
          ) {
            tagToRemove = prevNode;

            // 删除空格
            node.textContent =
              textContent.substring(0, offset - 1) +
              textContent.substring(offset);
          }
        }
      }

      // 如果找到了要移除的标签
      if (tagToRemove) {
        // 阻止默认的键盘事件
        e.preventDefault();
        // 阻止事件冒泡
        e.stopPropagation();
        // 调用处理标签移除的函数
        handleTagRemoval(tagToRemove, range, selection);
      }
    }
  };

  // 处理编辑器键盘事件
  const handleEditorKeyDown = (e) => {
    handleKeyDown(e);

    if (e.key === "Backspace" || e.key === "Delete") {
      setTimeout(() => {
        const content = editorRef.current?.textContent || "";
        if (!content.includes("#") && showDropdown) {
          setShowDropdown(false);
        }
      }, 0);
    }

    if (showDropdown && filteredMetrics.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prevIndex) => {
            const newIndex =
              prevIndex < filteredMetrics.length - 1
                ? prevIndex + 1
                : prevIndex;
            setTimeout(() => {
              const optionList = document.querySelector(`.${style.optionList}`);
              const selectedOption = optionList?.querySelector(
                `.${style.selected}`
              );
              if (optionList && selectedOption) {
                if (newIndex === filteredMetrics.length - 1) {
                  optionList.scrollTop = optionList.scrollHeight;
                } else {
                  const optionTop = selectedOption.offsetTop;
                  const optionHeight = selectedOption.offsetHeight;
                  const listScrollTop = optionList.scrollTop;
                  const listHeight = optionList.clientHeight;

                  if (optionTop + optionHeight > listScrollTop + listHeight) {
                    optionList.scrollTop =
                      optionTop + optionHeight - listHeight;
                  }
                }
              }
            }, 0);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prevIndex) => {
            const newIndex = prevIndex > 0 ? prevIndex - 1 : 0;
            setTimeout(() => {
              const optionList = document.querySelector(`.${style.optionList}`);
              const selectedOption = optionList?.querySelector(
                `.${style.selected}`
              );
              if (optionList && selectedOption) {
                if (newIndex === 0) {
                  optionList.scrollTop = 0;
                } else {
                  const optionTop = selectedOption.offsetTop;
                  const listScrollTop = optionList.scrollTop;

                  if (optionTop < listScrollTop) {
                    optionList.scrollTop = optionTop;
                  }
                }
              }
            }, 0);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredMetrics.length) {
            handleMetricSelect(filteredMetrics[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          break;
        default:
          break;
      }
    }
  };

  // 点击其他区域关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isInDropdown = target.closest(`.${style.dropdown}`);
      const isInEditor =
        editorRef.current && editorRef.current.contains(target);

      if (!isInDropdown && !isInEditor) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 当搜索文本变化或下拉框显示状态变化时，重置选中索引
  useEffect(() => {
    if (showDropdown && filteredMetrics.length > 0) {
      setSelectedIndex(0);
    }
  }, [showDropdown, searchText, filteredMetrics.length]);

  // 初始化编辑器内容
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;

    // 清空编辑器
    editor.innerHTML = "";

    if (value) {
      editor.innerHTML = convertFormulaToTags(value, metricOptions);
    }
  }, [value, metricOptions]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
    getEditorRef: () => editorRef.current, // 暴露editorRef本身
    getValue: () => {
      if (!editorRef.current) return "";
      const editor = editorRef.current;
      const tags = editor.getElementsByClassName(style.tag);
      let formula = editor.innerHTML;

      Array.from(tags).forEach((tag) => {
        const key = tag.getAttribute("data-key");
        if (key) {
          formula = formula.replace(tag.outerHTML, key);
        }
      });

      // 解码HTML实体，将&nbsp;等转换回原始字符
      const decodeHtmlEntities = (html) => {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = html;
        return textArea.value;
      };

      return decodeHtmlEntities(formula);
    },
    setValue: (value) => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = convertFormulaToTags(value, metricOptions);
    },
  }));

  return (
    <div className={style.formulaEditor}>
      <div
        ref={editorRef}
        className={style.editor}
        contentEditable
        onInput={handleEditorInput}
        onKeyDown={handleEditorKeyDown}
        onKeyUp={handleEditorKeyUp}
        onClick={handleEditorClick}
        data-placeholder={placeholder}
      />
      {showDropdown && (
        <div className={style.dropdown} onClick={(e) => e.stopPropagation()}>
          <Input
            placeholder="搜索指标"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={style.searchInput}
          />
          <div className={style.optionList}>
            {filteredMetrics.map((metric, index) => (
              <div
                key={metric.id}
                className={`${style.option} ${
                  index === selectedIndex ? style.selected : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMetricSelect(metric);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span>{metric.name}</span>
                <span className={style.metricKey}>{metric.key}</span>
              </div>
            ))}
            {filteredMetrics.length === 0 && (
              <div className={style.noData}>无匹配指标</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
