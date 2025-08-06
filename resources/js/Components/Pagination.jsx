export default function Pagination({ links, onPageClick }) {
    if (!links) return null;
    return (
        <div className="flex gap-2 mt-6 justify-center flex-wrap">
            {links.map((link, idx) => (
                <button
                    key={idx}
                    disabled={!link.url || link.active}
                    onClick={async () => {
                        await onPageClick(link.url);
                    }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 rounded border text-sm transition-all duration-200 ${
                        link.active
                            ? "bg-teal-700 text-teal-100 font-semibold"
                            : "bg-teal-500 text-teal-100 hover:bg-teal-700"
                    } ${
                        !link.url
                            ? " opacity-70 cursor-not-allowed"
                            : ""
                    }`}
                />
            ))}
        </div>
    );
}
