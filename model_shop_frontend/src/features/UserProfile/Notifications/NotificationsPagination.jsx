const NotificationsPagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center gap-2 mt-4">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        className={`px-4 py-2 rounded ${
          currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onPageChange(page)}
      >
        {page}
      </button>
    ))}
  </div>
);
