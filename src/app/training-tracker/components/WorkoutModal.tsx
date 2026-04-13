// WorkoutModal component - Form interface for adding/editing workouts

import React, { useEffect } from 'react';
import { Modal, Form, Radio, InputNumber, Button, Space } from 'antd';
import { Workout, WorkoutType } from '../types';

export interface WorkoutModalProps {
  open: boolean;
  workout: Workout | undefined;
  dayInfo: { week: number; day: number; dayName: string };
  onSave: (workout: Workout) => void;
  onDelete: () => void;
  onCancel: () => void;
}

interface FormValues {
  type: WorkoutType;
  duration: number;
  heartRate?: number;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  open,
  workout,
  dayInfo,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [form] = Form.useForm<FormValues>();

  // Reset form when modal opens or workout changes
  useEffect(() => {
    if (open) {
      if (workout) {
        form.setFieldsValue({
          type: workout.type,
          duration: workout.duration,
          heartRate: workout.heartRate,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, workout, form]);

  const handleSubmit = (values: FormValues) => {
    const newWorkout: Workout = {
      type: values.type,
      duration: values.duration,
      heartRate: values.heartRate,
      date: new Date().toISOString(),
    };
    onSave(newWorkout);
  };

  return (
    <Modal
      title={`${workout ? 'Edit' : 'Add'} Workout - Week ${dayInfo.week}, ${dayInfo.dayName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'zone2',
          duration: undefined,
        }}
      >
        <Form.Item
          label="Workout Type"
          name="type"
          rules={[{ required: true, message: 'Please select workout type' }]}
        >
          <Radio.Group>
            <Radio value="zone2">Zone 2</Radio>
            <Radio value="hiit">HIIT</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Duration (minutes)"
          name="duration"
          rules={[
            { required: true, message: 'Please enter duration' },
            { 
              type: 'number', 
              min: 1, 
              message: 'Duration must be at least 1 minute' 
            },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="Enter minutes"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          label="Heart Rate (bpm)"
          name="heartRate"
          rules={[
            { 
              type: 'number', 
              min: 40, 
              max: 220,
              message: 'Heart rate must be between 40 and 220 bpm' 
            },
          ]}
        >
          <InputNumber
            min={40}
            max={220}
            style={{ width: '100%' }}
            placeholder="Optional"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button onClick={onCancel}>
                Cancel
              </Button>
            </Space>
            {workout && (
              <Button danger onClick={onDelete}>
                Delete
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
