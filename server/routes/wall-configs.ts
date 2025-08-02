import { RequestHandler } from "express";

interface WallConfigRequest {
  width: number;
  height: number;
  finish: {
    category: string;
    color: string;
    texture?: string;
  };
  accessories: Record<string, boolean | number>;
  installation: 'diy' | 'professional';
}

interface SavedWallConfig extends WallConfigRequest {
  id: number;
  created_at: string;
}

// In-memory storage for demo purposes
// In a real application, this would be a database
let wallConfigs: SavedWallConfig[] = [];
let nextId = 1;

export const saveWallConfig: RequestHandler = (req, res) => {
  try {
    const configData: WallConfigRequest = req.body;

    // Validate required fields
    if (!configData.width || !configData.height || !configData.finish) {
      return res.status(400).json({
        error: 'Missing required fields: width, height, finish'
      });
    }

    // Create new configuration
    const newConfig: SavedWallConfig = {
      id: nextId++,
      ...configData,
      created_at: new Date().toISOString()
    };

    // Save to storage
    wallConfigs.push(newConfig);

    // Return success response
    res.status(201).json({
      message: 'Wall configuration saved successfully',
      wall_config: {
        id: newConfig.id,
        created_at: newConfig.created_at
      }
    });
  } catch (error) {
    console.error('Error saving wall configuration:', error);
    res.status(500).json({
      error: 'Internal server error while saving configuration'
    });
  }
};

export const getWallConfig: RequestHandler = (req, res) => {
  try {
    const configId = parseInt(req.params.id);
    
    if (isNaN(configId)) {
      return res.status(400).json({
        error: 'Invalid configuration ID'
      });
    }

    const config = wallConfigs.find(c => c.id === configId);
    
    if (!config) {
      return res.status(404).json({
        error: 'Configuration not found'
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error retrieving wall configuration:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving configuration'
    });
  }
};

export const getAllWallConfigs: RequestHandler = (req, res) => {
  try {
    // Return only basic info, not full configurations
    const configsList = wallConfigs.map(config => ({
      id: config.id,
      width: config.width,
      height: config.height,
      finish_category: config.finish.category,
      created_at: config.created_at
    }));

    res.json({
      configurations: configsList,
      total: configsList.length
    });
  } catch (error) {
    console.error('Error retrieving wall configurations:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving configurations'
    });
  }
};
