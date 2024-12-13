import { cn } from "@/lib/utils";
import { getTimeDifference } from "@/utils/helpers";
import { X } from "lucide-react";
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

const InvoiceCreateNotification = ({
  notification,
  handleReadNotification,
  handleDeleteNotification,
}) => {
  const handleDelete = async (e) => {
    e.preventDefault();
    await handleDeleteNotification(notification.id);
  };

  return (
    <Link
      to={"/invoices"}
      className={cn(
        "p-3 border-b rounded-md relative group hover:bg-slate-100 hover:text-black transition-all",
        !notification.isRead && "bg-slate-50"
      )}
      onClick={() => handleReadNotification(notification.id)}
    >
      <span className="text-xs">
        {getTimeDifference(notification.createdAt)}
      </span>
      <h2 className="font-semibold text-base">{notification.title}</h2>
      <p className="text-muted-foreground  ">{notification.message}</p>
      <div className="pl-10 flex gap-2 mt-2 ">
        <div>
          <LazyLoadImage
            effect="blur"
            src={notification.data.rentedRoom.listing.images[0].url}
            className="size-16 min-w-16 rounded-md "
          />
        </div>
        <div>
          <p className="font-semibold text-base">
            {notification.data.rentedRoom.listing.title}
          </p>
          <p>{notification.data.rentedRoom.listing.address}</p>
        </div>
      </div>
      {!notification.isRead && (
        <span className="absolute size-2 rounded-full bg-primary top-2 right-2 animate-pulse"></span>
      )}
      <span
        onClick={handleDelete}
        className="absolute p-2 rounded-full group-hover:block hidden hover:shadow-sm transition-all hover:bg-white right-3 top-1/2 -translate-y-1/2"
      >
        <X className="size-4" />
      </span>
    </Link>
  );
};

export default InvoiceCreateNotification;
