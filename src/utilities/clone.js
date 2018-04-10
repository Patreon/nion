// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
export default function clone(input) {
    return JSON.parse(JSON.stringify(input))
}
