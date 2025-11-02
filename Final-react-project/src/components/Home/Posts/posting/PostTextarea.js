export default function PostTextarea({ value, onChange, placeholder }) {
    return (
        <textarea
            autoFocus={true}
            className="post-textarea"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
