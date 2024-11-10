import torch.optim as optim
from tqdm import tqdm
from model import DualChannelModel
from preprocess import VideoDataset
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import transforms
from preprocess import create_dataloaders
from EfficientVit import EfficientViTModel
from Resnet import LightVideoModelWithLSTM

def train_model(model, train_loader, criterion, optimizer, device, num_epochs=10):
    model.to(device)
    
    accuracy_stats = {'train': []}
    loss_stats = {'train': []}
    
    for epoch in range(num_epochs):
        model.train()
        
        running_loss = 0.0
        correct_preds = 0
        total_samples = 0
        
        # Progress bar for each epoch
        pbar = tqdm(train_loader, desc=f"Epoch [{epoch+1}/{num_epochs}]")
        
        for frames, labels in pbar:
            # Move data to device
            frames, labels = frames.to(device), labels.to(device)
            batch_size, num_frames, _, _, _ = frames.shape
            # print(labels.shape)
            # Changing labels to [B, 1] shape
            labels = labels.unsqueeze(1)

            frame_output = []
            # Process each frame individually and accumulate results
            frame_outputs = []

            for f in range(num_frames):
                frame = frames[:, f, :, :, :]  # Shape: [B, C, H, W]
                outputs = model(frame)  # Shape: [B]
                frame_outputs.append(outputs)

            # Aggregate predictions across frames, e.g., by averaging
            final_outputs = torch.mean(torch.stack(frame_outputs), dim=0)

            # Calculate loss and metrics based on aggregated output
            loss = criterion(final_outputs, labels.float())
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * batch_size
            preds = (final_outputs > 0.55).long()
            correct_preds += (preds == labels).sum().item()
            total_samples += batch_size


            # Update progress bar
            pbar.set_postfix({'Loss': running_loss / total_samples, 'Accuracy': correct_preds / total_samples * 100})
        
        # Print epoch summary
        epoch_loss = running_loss / total_samples
        epoch_accuracy = correct_preds / total_samples * 100
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {epoch_loss:.4f}, Accuracy: {epoch_accuracy:.2f}%")
        accuracy_stats['train'].append(epoch_accuracy)
        loss_stats['train'].append(epoch_loss)
    
    print('Finished Training')
    return accuracy_stats, loss_stats

# Instantiate model, dataloader, optimizer, and criterion

if __name__ == "__main__":
    model = EfficientViTModel()
    # Define loss and optimizer
    device = torch.device('mps')
    criterion = nn.BCEWithLogitsLoss()  # For classification
    optimizer = optim.Adam(model.parameters(), lr=0.0001)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((224, 224)),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    train_loader, test_loader = create_dataloaders('Celeb-DF-v2', batch_size=4, num_frames=16, transform=transform)
    # Train the model
    accuracy, loss = train_model(model, train_loader, criterion, optimizer, device, num_epochs=30)
    
    # Save the trained model
    torch.save(model.state_dict(), 'Swin/models/Model_Eff_Vit_30_16NF_2.pth')
    # Plot training metrics
    import matplotlib.pyplot as plt
    plt.figure(figsize=(10, 5))
    plt.plot(accuracy['train'], label='Train Accuracy')
    plt.plot(loss['train'], label='Train Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy / Loss')
    plt.legend()
    plt.show()
    
