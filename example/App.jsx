import React, { useState } from "react";
import { FormulaEditor } from "./FormulaEditor";

const App = () => {
  const [formula, setFormula] = useState(
    "SUM(sales_amount) + AVG(profit_rate)"
  );
  const [des, setDes] = useState("SUM(销售额) + AVG(利润率)");

  const metricOptions = [
    { id: "1", name: "销售额", key: "sales_amount" },
    { id: "2", name: "利润率", key: "profit_rate" },
    { id: "3", name: "订单数量", key: "order_count" },
    { id: "4", name: "客户数量", key: "customer_count" },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Formula Editor Example</h1>
      <div style={{ marginBottom: "20px" }}>
        <h3>当前公式值:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {des}
        </pre>
      </div>
      <FormulaEditor
        value={formula}
        onChange={setFormula}
        metricOptions={metricOptions}
        placeholder="请输入公式，输入 $ 可选择指标"
      />
    </div>
  );
};

// const container = document.getElementById("root");
// if (container) {
//   const root = createRoot(container);
//   root.render(<App />);
// }

export default App;
