// Validation middleware for common fields
export const validateBook = (req, res, next) => {
  const { title, author, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Book title is required",
    });
  }

  if (!author || !author.trim()) {
    return res.status(400).json({
      success: false,
      message: "Book author is required",
    });
  }

  if (!category || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Book category is required",
    });
  }

  next();
};

export const validateArticle = (req, res, next) => {
  const { title, author, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Article title is required",
    });
  }

  if (!author || !author.trim()) {
    return res.status(400).json({
      success: false,
      message: "Article author is required",
    });
  }

  if (!category || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Article category is required",
    });
  }

  next();
};

export const validateWebinar = (req, res, next) => {
  const { title, description, speaker, date, duration, max_attendees } =
    req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Webinar title is required",
    });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: "Webinar description is required",
    });
  }

  if (!speaker || !speaker.trim()) {
    return res.status(400).json({
      success: false,
      message: "Webinar speaker is required",
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Webinar date is required",
    });
  }

  if (!duration || duration < 1) {
    return res.status(400).json({
      success: false,
      message: "Valid webinar duration is required",
    });
  }

  if (!max_attendees || max_attendees < 1) {
    return res.status(400).json({
      success: false,
      message: "Valid max attendees is required",
    });
  }

  next();
};
