import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { getCollection } from "../config/database.js";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for parsing webinar tags safely
const parseWebinarTags = (webinar) => {
  let parsedTags = [];

  try {
    if (webinar.tags) {
      if (typeof webinar.tags === "string") {
        parsedTags = JSON.parse(webinar.tags);
      } else {
        parsedTags = webinar.tags;
      }

      if (!Array.isArray(parsedTags)) {
        parsedTags = [];
      }
    }
  } catch (error) {
    console.warn(
      `⚠️ Failed to parse tags for webinar ${webinar._id}:`,
      error.message
    );
    parsedTags = [];
  }

  return {
    ...webinar,
    tags: parsedTags,
    price: parseFloat(webinar.price) || 0,
    is_premium: Boolean(webinar.is_premium),
  };
};

// Get all scheduled webinars
export const getWebinars = async (req, res) => {
  try {
    console.log("🎓 Fetching scheduled webinars...");

    const contentCollection = await getCollection("content");

    // Query for webinars with status scheduled, sorted by date
    const webinarsCursor = contentCollection.find({
      type: "webinar",
      "metadata.webinar.status": "scheduled"
    }, {
      projection: {
        _id: 1,
        title: 1,
        description: 1,
        author: 1, // speaker
        "metadata.webinar.speakerBio": 1,
        "metadata.webinar.date": 1,
        "metadata.webinar.duration": 1,
        "metadata.webinar.maxAttendees": 1,
        "metadata.webinar.currentAttendees": 1,
        "metadata.webinar.joinLink": 1,
        "metadata.webinar.recordingLink": 1,
        "metadata.webinar.status": 1,
        "metadata.webinar.imageUrl": 1,
        price: 1,
        is_premium: 1,
        category: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    .sort({ "metadata.webinar.date": 1 })
    .limit(50);

    const webinars = await webinarsCursor.toArray();
    console.log(`✅ Found ${webinars.length} scheduled webinars`);

    // Process image URLs and parse tags
    const processedWebinars = webinars.map(webinar => {
      const parsed = parseWebinarTags(webinar);
      
      // Fix image URL if exists
      if (parsed.metadata?.webinar?.imageUrl) {
        const imageUrl = parsed.metadata.webinar.imageUrl;
        // If it's just a filename, convert to full URL
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads')) {
          parsed.metadata.webinar.imageUrl = `/uploads/webinars/images/${imageUrl}`;
        } else if (imageUrl.startsWith('uploads/webinars/images/')) {
          parsed.metadata.webinar.imageUrl = `/${imageUrl}`;
        }
      }
      
      // Map to expected response format
      return {
        id: parsed._id,
        title: parsed.title,
        description: parsed.description,
        speaker: parsed.author,
        speaker_bio: parsed.metadata?.webinar?.speakerBio,
        date: parsed.metadata?.webinar?.date,
        duration: parsed.metadata?.webinar?.duration,
        max_attendees: parsed.metadata?.webinar?.maxAttendees,
        current_attendees: parsed.metadata?.webinar?.currentAttendees,
        join_link: parsed.metadata?.webinar?.joinLink,
        recording_link: parsed.metadata?.webinar?.recordingLink,
        status: parsed.metadata?.webinar?.status,
        image_url: parsed.metadata?.webinar?.imageUrl,
        price: parsed.price,
        is_premium: parsed.is_premium,
        category: parsed.category,
        tags: parsed.tags,
        created_at: parsed.createdAt,
        updated_at: parsed.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        webinars: processedWebinars,
        total: webinars.length,
      },
    });
  } catch (error) {
    console.error("❌ Get webinars error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get single webinar by ID
export const getWebinarById = async (req, res) => {
  try {
    const { id } = req.params;

    const contentCollection = await getCollection("content");

    const webinar = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "webinar"
    });

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    // Parse tags and process data
    let parsedWebinar = parseWebinarTags(webinar);
    
    // Fix image URL
    if (parsedWebinar.metadata?.webinar?.imageUrl && 
        !parsedWebinar.metadata.webinar.imageUrl.startsWith('http') && 
        !parsedWebinar.metadata.webinar.imageUrl.startsWith('/uploads')) {
      parsedWebinar.metadata.webinar.imageUrl = `/uploads/webinars/images/${parsedWebinar.metadata.webinar.imageUrl}`;
    }

    // Map to expected response format
    const responseWebinar = {
      id: parsedWebinar._id,
      title: parsedWebinar.title,
      description: parsedWebinar.description,
      speaker: parsedWebinar.author,
      speaker_bio: parsedWebinar.metadata?.webinar?.speakerBio,
      date: parsedWebinar.metadata?.webinar?.date,
      duration: parsedWebinar.metadata?.webinar?.duration,
      max_attendees: parsedWebinar.metadata?.webinar?.maxAttendees,
      current_attendees: parsedWebinar.metadata?.webinar?.currentAttendees,
      join_link: parsedWebinar.metadata?.webinar?.joinLink,
      recording_link: parsedWebinar.metadata?.webinar?.recordingLink,
      status: parsedWebinar.metadata?.webinar?.status,
      image_url: parsedWebinar.metadata?.webinar?.imageUrl,
      price: parsedWebinar.price,
      is_premium: parsedWebinar.is_premium,
      category: parsedWebinar.category,
      tags: parsedWebinar.tags,
      created_at: parsedWebinar.createdAt,
      updated_at: parsedWebinar.updatedAt,
      registrations: parsedWebinar.registrations || []
    };

    res.json({
      success: true,
      data: { webinar: responseWebinar },
    });
  } catch (error) {
    console.error("❌ Get webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar",
    });
  }
};

// Get webinar categories
export const getWebinarCategories = async (req, res) => {
  try {
    const contentCollection = await getCollection("content");

    const categories = await contentCollection.distinct("category", {
      type: "webinar",
      "metadata.webinar.status": "scheduled",
      category: { $ne: null }
    });

    res.json({
      success: true,
      data: {
        categories: categories,
      },
    });
  } catch (error) {
    console.error("❌ Get webinar categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar categories",
    });
  }
};

// Register for webinar
export const registerForWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company } = req.body;

    console.log(`📝 Registration attempt for webinar ${id}:`, { name, email, company });

    const contentCollection = await getCollection("content");

    // Check if webinar exists and has available spots
    const webinar = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "webinar"
    });

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    const maxAttendees = webinar.metadata?.webinar?.maxAttendees || 0;
    const currentAttendees = webinar.metadata?.webinar?.currentAttendees || 0;

    if (currentAttendees >= maxAttendees) {
      return res.status(400).json({
        success: false,
        message: "Webinar is full",
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = webinar.registrations?.some(
      reg => reg.email === email
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this webinar",
      });
    }

    // Register user - using update with $push
    const registration = {
      userId: req.user?._id || null,
      name: name,
      email: email,
      company: company || null,
      registeredAt: new Date(),
      attended: false,
      attendanceTime: null
    };

    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id), type: "webinar" },
      { 
        $push: { registrations: registration },
        $inc: { "metadata.webinar.currentAttendees": 1 },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to register for webinar");
    }

    // Get updated attendee count
    const updatedWebinar = await contentCollection.findOne({
      _id: new ObjectId(id)
    }, {
      projection: { "metadata.webinar.currentAttendees": 1 }
    });

    console.log(`✅ Registration successful for ${name}. Total attendees: ${updatedWebinar.metadata?.webinar?.currentAttendees || 0}`);

    res.json({
      success: true,
      message: "Successfully registered for webinar",
      data: {
        attendees: updatedWebinar.metadata?.webinar?.currentAttendees || 0,
        registrationId: registration._id
      }
    });
  } catch (error) {
    console.error("❌ Register for webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering for webinar: " + error.message,
    });
  }
};

// Health check endpoint
export const getWebinarHealth = async (req, res) => {
  try {
    const contentCollection = await getCollection("content");

    const count = await contentCollection.countDocuments({
      type: "webinar",
      "metadata.webinar.status": "scheduled"
    });

    res.json({
      success: true,
      message: `Webinars API is working! Found ${count} scheduled webinars.`,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Webinars API health check failed: " + error.message,
    });
  }
};

// Get all webinars for admin
export const getAdminWebinars = async (req, res) => {
  try {
    const contentCollection = await getCollection("content");

    const webinarsCursor = contentCollection.find({
      type: "webinar"
    }, {
      projection: {
        _id: 1,
        title: 1,
        description: 1,
        author: 1,
        "metadata.webinar.speakerBio": 1,
        "metadata.webinar.date": 1,
        "metadata.webinar.duration": 1,
        "metadata.webinar.maxAttendees": 1,
        "metadata.webinar.currentAttendees": 1,
        "metadata.webinar.joinLink": 1,
        "metadata.webinar.recordingLink": 1,
        "metadata.webinar.status": 1,
        "metadata.webinar.imageUrl": 1,
        price: 1,
        is_premium: 1,
        category: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1,
        registrations: 1
      }
    })
    .sort({ "metadata.webinar.date": -1 });

    const webinars = await webinarsCursor.toArray();

    // Process webinars
    const processedWebinars = webinars.map(webinar => {
      const parsed = parseWebinarTags(webinar);
      
      // Fix image URL
      if (parsed.metadata?.webinar?.imageUrl && 
          !parsed.metadata.webinar.imageUrl.startsWith('http') && 
          !parsed.metadata.webinar.imageUrl.startsWith('/uploads')) {
        parsed.metadata.webinar.imageUrl = `/uploads/webinars/images/${parsed.metadata.webinar.imageUrl}`;
      }
      
      // Map to expected response format
      return {
        id: parsed._id,
        title: parsed.title,
        description: parsed.description,
        speaker: parsed.author,
        speaker_bio: parsed.metadata?.webinar?.speakerBio,
        date: parsed.metadata?.webinar?.date,
        duration: parsed.metadata?.webinar?.duration,
        max_attendees: parsed.metadata?.webinar?.maxAttendees,
        current_attendees: parsed.metadata?.webinar?.currentAttendees,
        join_link: parsed.metadata?.webinar?.joinLink,
        recording_link: parsed.metadata?.webinar?.recordingLink,
        status: parsed.metadata?.webinar?.status,
        image_url: parsed.metadata?.webinar?.imageUrl,
        price: parsed.price,
        is_premium: parsed.is_premium,
        category: parsed.category,
        tags: parsed.tags,
        created_at: parsed.createdAt,
        updated_at: parsed.updatedAt,
        registration_count: parsed.registrations?.length || 0
      };
    });

    res.json({
      success: true,
      data: {
        webinars: processedWebinars,
      },
    });
  } catch (error) {
    console.error("❌ Get admin webinars error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars",
    });
  }
};

// Get webinar registrations
export const getWebinarRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    const contentCollection = await getCollection("content");

    const webinar = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "webinar"
    }, {
      projection: {
        title: 1,
        registrations: 1
      }
    });

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    // Map registrations to expected format
    const registrations = (webinar.registrations || []).map(reg => ({
      id: reg._id,
      webinar_id: id,
      webinar_title: webinar.title,
      name: reg.name,
      email: reg.email,
      company: reg.company,
      registered_at: reg.registeredAt,
      attended: reg.attended,
      attendance_time: reg.attendanceTime,
      user_id: reg.userId
    }));

    res.json({
      success: true,
      data: {
        registrations,
        total: registrations.length,
      },
    });
  } catch (error) {
    console.error("❌ Get webinar registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar registrations",
    });
  }
};

// Create webinar
export const createWebinar = async (req, res) => {
  try {
    const {
      title,
      description,
      speaker,
      speaker_bio,
      date,
      duration,
      max_attendees,
      join_link,
      recording_link,
      price,
      is_premium,
      category,
      tags,
      status,
    } = req.body;

    console.log("📥 Creating webinar with data:", req.body);
    console.log("📁 Files received:", req.files);

    if (
      !title ||
      !description ||
      !speaker ||
      !date ||
      !duration ||
      !max_attendees
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, speaker, date, duration, and max_attendees are required fields",
      });
    }

    // Handle tags
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
    }

    // Handle image upload
    let imageUrl = null;
    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      
      // Store just the filename (not full path)
      imageUrl = imageFile.filename;
      
      console.log("🖼️ Webinar image saved:", imageUrl);
      
      // Move the file to correct directory
      const uploadDir = path.join(__dirname, '../uploads/webinars/images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const oldPath = imageFile.path;
      const newPath = path.join(uploadDir, imageFile.filename);
      
      if (fs.existsSync(oldPath) && oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
      }
    }

    const contentCollection = await getCollection("content");

    // Create webinar document
    const webinarDocument = {
      contentId: `WEB-${Date.now().toString().slice(-8)}`,
      type: "webinar",
      title: title,
      author: speaker, // speaker stored as author
      description: description,
      category: category || "Education",
      tags: tagsArray,
      price: price ? parseFloat(price) : 0.0,
      is_premium: Boolean(is_premium),
      
      metadata: {
        webinar: {
          speakerBio: speaker_bio || null,
          date: new Date(date),
          duration: parseInt(duration),
          maxAttendees: parseInt(max_attendees),
          currentAttendees: 0,
          joinLink: join_link || null,
          recordingLink: recording_link || null,
          status: status || "scheduled",
          imageUrl: imageUrl
        }
      },
      
      statistics: {
        views: 0,
        registrations: 0
      },
      
      registrations: [], // Start with empty registrations
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await contentCollection.insertOne(webinarDocument);
    
    // Get the created webinar
    const createdWebinar = await contentCollection.findOne({ _id: result.insertedId });

    // Parse and format response
    let parsedWebinar = parseWebinarTags(createdWebinar);
    
    // Add full image URL to response
    if (parsedWebinar.metadata?.webinar?.imageUrl) {
      parsedWebinar.metadata.webinar.imageUrl = `/uploads/webinars/images/${parsedWebinar.metadata.webinar.imageUrl}`;
    }

    // Map to expected response format
    const responseWebinar = {
      id: parsedWebinar._id,
      title: parsedWebinar.title,
      description: parsedWebinar.description,
      speaker: parsedWebinar.author,
      speaker_bio: parsedWebinar.metadata?.webinar?.speakerBio,
      date: parsedWebinar.metadata?.webinar?.date,
      duration: parsedWebinar.metadata?.webinar?.duration,
      max_attendees: parsedWebinar.metadata?.webinar?.maxAttendees,
      current_attendees: parsedWebinar.metadata?.webinar?.currentAttendees,
      join_link: parsedWebinar.metadata?.webinar?.joinLink,
      recording_link: parsedWebinar.metadata?.webinar?.recordingLink,
      status: parsedWebinar.metadata?.webinar?.status,
      image_url: parsedWebinar.metadata?.webinar?.imageUrl,
      price: parsedWebinar.price,
      is_premium: parsedWebinar.is_premium,
      category: parsedWebinar.category,
      tags: parsedWebinar.tags,
      created_at: parsedWebinar.createdAt,
      updated_at: parsedWebinar.updatedAt
    };

    console.log(`✅ New webinar created: ${title} by ${speaker}`);

    res.status(201).json({
      success: true,
      message: "Webinar created successfully",
      data: {
        webinar: responseWebinar,
      },
    });
  } catch (error) {
    console.error("❌ Create webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating webinar: " + error.message,
    });
  }
};

// Update webinar
export const updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📥 Admin: Updating webinar ${id} with data:`, updateData);
    console.log("📁 Files:", req.files);

    const contentCollection = await getCollection("content");

    // Check if webinar exists
    const existingWebinar = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "webinar"
    });

    if (!existingWebinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    // Handle image upload
    let imageUrl = existingWebinar.metadata?.webinar?.imageUrl;
    
    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      
      // Delete old image if exists
      if (existingWebinar.metadata?.webinar?.imageUrl) {
        const oldImagePath = path.join(__dirname, '../uploads/webinars/images', existingWebinar.metadata.webinar.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Store new image filename
      imageUrl = imageFile.filename;
      
      // Move to correct directory
      const uploadDir = path.join(__dirname, '../uploads/webinars/images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const oldPath = imageFile.path;
      const newPath = path.join(uploadDir, imageFile.filename);
      
      if (fs.existsSync(oldPath) && oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
      }
      
      console.log("🖼️ Webinar image updated:", imageUrl);
    }

    // Prepare update operations
    const updateOperations = { $set: { updatedAt: new Date() } };

    // Update basic fields
    if (updateData.title !== undefined) updateOperations.$set.title = updateData.title;
    if (updateData.description !== undefined) updateOperations.$set.description = updateData.description;
    if (updateData.speaker !== undefined) updateOperations.$set.author = updateData.speaker;
    if (updateData.category !== undefined) updateOperations.$set.category = updateData.category;
    if (updateData.price !== undefined) updateOperations.$set.price = parseFloat(updateData.price) || 0.0;
    if (updateData.is_premium !== undefined) updateOperations.$set.is_premium = Boolean(updateData.is_premium);
    
    // Update tags
    if (updateData.tags !== undefined) {
      let tagsArray = [];
      if (Array.isArray(updateData.tags)) {
        tagsArray = updateData.tags;
      } else if (typeof updateData.tags === "string") {
        tagsArray = updateData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
      updateOperations.$set.tags = tagsArray;
    }

    // Update webinar metadata
    const webinarMetadata = {};
    
    if (updateData.speaker_bio !== undefined) webinarMetadata.speakerBio = updateData.speaker_bio;
    if (updateData.date !== undefined) webinarMetadata.date = new Date(updateData.date);
    if (updateData.duration !== undefined) webinarMetadata.duration = parseInt(updateData.duration);
    if (updateData.max_attendees !== undefined) webinarMetadata.maxAttendees = parseInt(updateData.max_attendees);
    if (updateData.join_link !== undefined) webinarMetadata.joinLink = updateData.join_link;
    if (updateData.recording_link !== undefined) webinarMetadata.recordingLink = updateData.recording_link;
    if (updateData.status !== undefined) webinarMetadata.status = updateData.status;
    
    // Always update image URL
    webinarMetadata.imageUrl = imageUrl;

    if (Object.keys(webinarMetadata).length > 0) {
      updateOperations.$set["metadata.webinar"] = {
        ...existingWebinar.metadata?.webinar,
        ...webinarMetadata
      };
    }

    // Perform update
    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperations
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made to webinar",
      });
    }

    // Get updated webinar
    const updatedWebinar = await contentCollection.findOne({ _id: new ObjectId(id) });

    // Parse and format response
    let parsedWebinar = parseWebinarTags(updatedWebinar);
    
    // Add full image URL to response
    if (parsedWebinar.metadata?.webinar?.imageUrl) {
      parsedWebinar.metadata.webinar.imageUrl = `/uploads/webinars/images/${parsedWebinar.metadata.webinar.imageUrl}`;
    }

    // Map to expected response format
    const responseWebinar = {
      id: parsedWebinar._id,
      title: parsedWebinar.title,
      description: parsedWebinar.description,
      speaker: parsedWebinar.author,
      speaker_bio: parsedWebinar.metadata?.webinar?.speakerBio,
      date: parsedWebinar.metadata?.webinar?.date,
      duration: parsedWebinar.metadata?.webinar?.duration,
      max_attendees: parsedWebinar.metadata?.webinar?.maxAttendees,
      current_attendees: parsedWebinar.metadata?.webinar?.currentAttendees,
      join_link: parsedWebinar.metadata?.webinar?.joinLink,
      recording_link: parsedWebinar.metadata?.webinar?.recordingLink,
      status: parsedWebinar.metadata?.webinar?.status,
      image_url: parsedWebinar.metadata?.webinar?.imageUrl,
      price: parsedWebinar.price,
      is_premium: parsedWebinar.is_premium,
      category: parsedWebinar.category,
      tags: parsedWebinar.tags,
      created_at: parsedWebinar.createdAt,
      updated_at: parsedWebinar.updatedAt
    };

    console.log(`✅ Admin: Webinar updated: ID ${id}`);

    res.json({
      success: true,
      message: "Webinar updated successfully",
      data: {
        webinar: responseWebinar,
      },
    });
  } catch (error) {
    console.error("❌ Admin: Update webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating webinar: " + error.message,
    });
  }
};

// Delete webinar
export const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;

    const contentCollection = await getCollection("content");

    // Check if webinar exists
    const existingWebinar = await contentCollection.findOne({
      _id: new ObjectId(id),
      type: "webinar"
    });

    if (!existingWebinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    // Delete associated image if exists
    if (existingWebinar.metadata?.webinar?.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads/webinars/images', existingWebinar.metadata.webinar.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete webinar from MongoDB
    const result = await contentCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    console.log(`🗑️ Webinar deleted: ${existingWebinar.title} (ID: ${id})`);

    res.json({
      success: true,
      message: "Webinar deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete webinar error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting webinar: " + error.message,
    });
  }
};

// Get upcoming webinars (within next 7 days)
export const getUpcomingWebinars = async (req, res) => {
  try {
    const contentCollection = await getCollection("content");

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const webinarsCursor = contentCollection.find({
      type: "webinar",
      "metadata.webinar.status": "scheduled",
      "metadata.webinar.date": {
        $gte: today,
        $lte: nextWeek
      }
    }, {
      projection: {
        _id: 1,
        title: 1,
        description: 1,
        author: 1,
        "metadata.webinar.date": 1,
        "metadata.webinar.duration": 1,
        "metadata.webinar.imageUrl": 1,
        "metadata.webinar.maxAttendees": 1,
        "metadata.webinar.currentAttendees": 1,
        category: 1,
        tags: 1
      }
    })
    .sort({ "metadata.webinar.date": 1 })
    .limit(10);

    const webinars = await webinarsCursor.toArray();

    // Process webinars
    const processedWebinars = webinars.map(webinar => {
      // Fix image URL
      if (webinar.metadata?.webinar?.imageUrl && 
          !webinar.metadata.webinar.imageUrl.startsWith('http') && 
          !webinar.metadata.webinar.imageUrl.startsWith('/uploads')) {
        webinar.metadata.webinar.imageUrl = `/uploads/webinars/images/${webinar.metadata.webinar.imageUrl}`;
      }
      
      return {
        id: webinar._id,
        title: webinar.title,
        description: webinar.description,
        speaker: webinar.author,
        date: webinar.metadata?.webinar?.date,
        duration: webinar.metadata?.webinar?.duration,
        image_url: webinar.metadata?.webinar?.imageUrl,
        max_attendees: webinar.metadata?.webinar?.maxAttendees,
        current_attendees: webinar.metadata?.webinar?.currentAttendees,
        category: webinar.category,
        tags: webinar.tags,
        available_spots: (webinar.metadata?.webinar?.maxAttendees || 0) - (webinar.metadata?.webinar?.currentAttendees || 0)
      };
    });

    res.json({
      success: true,
      data: {
        webinars: processedWebinars,
        total: webinars.length,
      },
    });
  } catch (error) {
    console.error("❌ Get upcoming webinars error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming webinars",
    });
  }
};

// Mark attendance for webinar
export const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const contentCollection = await getCollection("content");

    // Find the registration and mark as attended
    const result = await contentCollection.updateOne(
      {
        _id: new ObjectId(id),
        type: "webinar",
        "registrations.email": email
      },
      {
        $set: {
          "registrations.$.attended": true,
          "registrations.$.attendanceTime": new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("❌ Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking attendance",
    });
  }
};