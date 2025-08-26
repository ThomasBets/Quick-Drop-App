export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex gap-2 mt-6 justify-center flex-wrap">
            {pages.map((page) => (
                <button
                    key={page}
                    disabled={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded border text-sm transition-all duration-200 ${
                        page === currentPage
                            ? "bg-teal-700 text-teal-100 font-semibold"
                            : "bg-teal-500 text-teal-100 hover:bg-teal-700"
                    }`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
}
