export default function Card({ as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag className={`premium-card rounded-2xl ${className}`} {...props}>
      {children}
    </Tag>
  );
}
