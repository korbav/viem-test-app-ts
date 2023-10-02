import { BigFloat } from "bigfloat-esnext";

export const formatValue = (value: string, decimals = 18) => {
    if(!value || value === "0") 
        return "0";
    else if(value.length < decimals) 
        return `0.${value}`;
    return `${(Number(value.slice(0, value.length - decimals))).toLocaleString("en-US")}.${value.slice(-1 * decimals)}`
}

export const formatValueSwappper = (_value: string) => {
    if(!_value) {
        return "0";
    }

    let value = _value.replace(/,/g, "");
    const decimalPart = value.indexOf(".") !== -1 ? value.slice(value.indexOf("."), value.length) : "";
    const intPart = value.replace(decimalPart, "").replace(/^0(0+)/, "0").replace(/^0([1-9]+)/, "$1");

    let formattedIntPart = "";
    for(let i = intPart.toString().length; i > 0; i -= 3) {
        formattedIntPart = intPart.toString().slice(Math.max(0, i - 3), i) + "," + formattedIntPart;
    }
    return `${formattedIntPart.replace(/,$/, "").replace(/^,/, "")}${decimalPart}`
}

export const parseFormattedValue = (value: string) => {
    return new BigFloat(value.replace(/,/g, ""))
}