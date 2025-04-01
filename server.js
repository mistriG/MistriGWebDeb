require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/worker-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'worker-dashboard.html'));
});

app.get('/worker-orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'worker-orders.html'));
});

app.get('/worker-earnings', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'worker-earnings.html'));
});

app.get('/worker-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'worker-profile.html'));
});

app.get('/worker-settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'worker-settings.html'));
});

app.get('/worker-register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'src', 'pages', 'worker-register.html'));
});

// API Routes

// Register a User
app.post("/api/register/user", async (req, res) => {
  const user = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: "user",
  };

  const params = {
    TableName: "Users",
    Item: user,
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "User registered successfully!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a Worker
app.post("/api/register/worker", async (req, res) => {
  const worker = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    skill: req.body.skill,
    location: req.body.location,
    experience: req.body.experience,
    hourlyRate: req.body.hourlyRate,
    regularPrice: req.body.regularPrice,
    availability: req.body.availability,
    address: {
      street: req.body.streetAddress,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country
    },
    verificationConsent: req.body.policeVerification,
    role: "worker",
    createdAt: new Date().toISOString()
  };

  const params = {
    TableName: "Workers",
    Item: worker,
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "Worker registered successfully!", worker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch All Users
app.get("/api/users", async (req, res) => {
  const params = {
    TableName: "Users",
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch All Workers
app.get("/api/workers", async (req, res) => {
  const params = {
    TableName: "Workers",
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
app.post("/api/orders", async (req, res) => {
  const order = {
    id: Date.now().toString(),
    userId: req.body.userId,
    workerId: req.body.workerId,
    serviceType: req.body.serviceType,
    description: req.body.description,
    location: req.body.location,
    price: req.body.price,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const params = {
    TableName: "Orders",
    Item: order,
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "Order created successfully!", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
app.get("/api/orders", async (req, res) => {
  const params = {
    TableName: "Orders",
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get worker orders
app.get("/api/workers/:workerId/orders", async (req, res) => {
  const params = {
    TableName: "Orders",
    FilterExpression: "workerId = :workerId",
    ExpressionAttributeValues: {
      ":workerId": req.params.workerId
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
app.put("/api/orders/:orderId/status", async (req, res) => {
  const params = {
    TableName: "Orders",
    Key: {
      id: req.params.orderId
    },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": req.body.status
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const data = await dynamoDB.update(params).promise();
    res.json({ message: "Order status updated successfully!", order: data.Attributes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// S3 file upload endpoint
app.post("/api/upload", async (req, res) => {
  if (!req.body.file || !req.body.fileName) {
    return res.status(400).json({ error: "File and fileName are required" });
  }

  const fileContent = Buffer.from(req.body.file, 'base64');
  const fileName = req.body.fileName;
  
  const params = {
    Bucket: process.env.S3_BUCKET || 'mistrig-uploads',
    Key: fileName,
    Body: fileContent
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({ 
      message: "File uploaded successfully", 
      fileUrl: data.Location 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AWS test routes for S3
app.get('/api/aws/buckets', async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();
    res.json({ success: true, buckets: data.Buckets });
  } catch (error) {
    console.error('Error listing buckets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/aws/objects/:bucket', async (req, res) => {
  try {
    const data = await s3.listObjects({ Bucket: req.params.bucket }).promise();
    res.json({ success: true, objects: data.Contents });
  } catch (error) {
    console.error('Error listing objects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AWS SDK configured for region: ${process.env.AWS_REGION}`);
}); 