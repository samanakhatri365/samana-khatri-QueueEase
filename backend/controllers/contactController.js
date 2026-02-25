import Contact from "../models/Contact.js";
import catchAsync from "../utils/catchAsync.js";

// Submit a contact message (public)
export const submitContact = catchAsync(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const contact = await Contact.create({
        name,
        email,
        subject,
        message
    });

    res.status(201).json({
        message: "Your message has been sent successfully!",
        contact: {
            id: contact._id,
            name: contact.name,
            subject: contact.subject
        }
    });
});

// Get all contact messages (admin only)
export const getAllContacts = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
        contacts,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total
        }
    });
});

// Update contact status (admin only)
export const updateContactStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const contact = await Contact.findByIdAndUpdate(
        id,
        { status, adminNotes },
        { new: true, runValidators: true }
    );

    if (!contact) {
        return res.status(404).json({ message: "Contact message not found" });
    }

    res.status(200).json({ message: "Contact updated", contact });
});

// Delete a contact message (admin only)
export const deleteContact = catchAsync(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
        return res.status(404).json({ message: "Contact message not found" });
    }

    res.status(200).json({ message: "Contact message deleted" });
});
