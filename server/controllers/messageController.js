import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import { generateTextWithFallback } from "../configs/openai.js";

// ─── Text-based AI Chat Message Controller ────────────────────────────────────
export const textMessageController = async (req, res) => {
  try {
    console.log("[textMessageController] HIT");

    const userId = req.user._id;

    // Guard: credit check
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;

    if (!chatId || !prompt) {
      return res
        .status(400)
        .json({ success: false, message: "chatId and prompt are required" });
    }

    // Guard: find chat safely
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Call Gemini BEFORE writing to DB — only persist on success
    console.log("[textMessageController] Calling Gemini API...");
    const responseText = await generateTextWithFallback(prompt);
    console.log(
      "[textMessageController] Gemini response received, length:",
      responseText.length
    );

    const now = Date.now();

    // Build both messages
    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: now - 1, // ensure ordering
      isImage: false,
    };

    const reply = {
      role: "assistant",
      content: responseText,
      timestamp: now,
      isImage: false,
    };

    // Persist both messages atomically
    chat.messages.push(userMessage, reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
    console.log("[textMessageController] Chat saved and credit deducted.");

    return res.json({ success: true, reply });
  } catch (error) {
    console.error("[textMessageController] ERROR:", error.message || error);

    const statusCode =
      error.status ||
      error.statusCode ||
      (error.response && error.response.status);

    if (statusCode === 429 || (error.message && error.message.includes("429"))) {
      return res.status(429).json({
        success: false,
        message: "AI quota exhausted. Please try again later.",
      });
    }

    if (
      statusCode === 400 ||
      statusCode === 403 ||
      (error.message &&
        (error.message.toLowerCase().includes("api key") ||
          error.message.toLowerCase().includes("api_key")))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid or missing Gemini API key. Check your .env configuration.",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: error.message || "Internal server error" });
  }
};

// ─── Image Generation Message Controller ──────────────────────────────────────
// Uses Pollinations.ai (free, no API key needed) to generate images,
// then uploads the result to ImageKit media library for permanent hosting.
export const imageMessageController = async (req, res) => {
  try {
    console.log("[imageMessageController] HIT");

    const userId = req.user._id;

    // Guard: credit check (image costs 2 credits)
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    if (!chatId || !prompt) {
      return res
        .status(400)
        .json({ success: false, message: "chatId and prompt are required" });
    }

    // Guard: find chat safely
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Generate image via Pollinations.ai BEFORE writing to DB
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${seed}&nologo=true`;

    console.log("[imageMessageController] Fetching image from Pollinations.ai...");

    const aiImageResponse = await axios.get(pollinationsUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: {
        "User-Agent": "AskioGPT/1.0",
      },
    });

    console.log(
      "[imageMessageController] Image fetched, size:",
      aiImageResponse.data.byteLength,
      "bytes | content-type:",
      aiImageResponse.headers["content-type"]
    );

    // Detect actual MIME type from response headers
    const contentType = aiImageResponse.headers["content-type"] || "image/jpeg";
    const mimeType = contentType.split(";")[0].trim();
    const ext = mimeType.includes("png") ? "png" : "jpg";

    // Convert buffer to base64 data URI for ImageKit upload
    const base64Image = `data:${mimeType};base64,${Buffer.from(
      aiImageResponse.data
    ).toString("base64")}`;

    // Upload to ImageKit for permanent URL
    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `askiogpt-${Date.now()}.${ext}`,
      folder: "/askiogpt",
    });

    console.log("[imageMessageController] Image uploaded to ImageKit:", uploadResponse.url);

    const now = Date.now();

    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: now - 1,
      isImage: false,
    };

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: now,
      isImage: true,
      isPublished: !!isPublished,
    };

    // Persist both messages atomically — only on success
    chat.messages.push(userMessage, reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
    console.log("[imageMessageController] Chat saved and credits deducted.");

    return res.json({ success: true, reply });
  } catch (error) {
    console.error("[imageMessageController] ERROR:", error.message || error);

    const statusCode =
      error.status ||
      error.statusCode ||
      (error.response && error.response.status);

    if (statusCode === 403) {
      return res.status(403).json({
        success: false,
        message:
          "Image upload failed: ImageKit returned 403. Check credentials in .env.",
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        message:
          "Image generation timed out. Please try again with a simpler prompt.",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: error.message || "Internal server error" });
  }
};
