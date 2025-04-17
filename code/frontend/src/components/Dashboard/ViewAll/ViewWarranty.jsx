<>
    <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
            {formatDate(asset.warranty_date)}
        </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${new Date(asset.warranty_date) < new Date()
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
                }`}>
                {new Date(asset.warranty_date) < new Date()
                    ? "Expired"
                    : `${asset.days_remaining} days`}
            </span>
        </div>
    </td>
</> 